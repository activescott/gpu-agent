# Sourced by scripts/dev (and, in future, scripts/test-e2e / scripts/logs-dev
# if this checkout adopts them) to compute the per-checkout dev instance
# identity. Pure computation — sourcing this file has no side effects.
#
# Every checkout of this repo (the main checkout or any git worktree) gets its
# own isolated dev instance in the shared kind cluster: its own namespace and
# its own hostname (there is no per-checkout database split yet — see
# GPUPOET_DEV_INSTANCE below). The kind cluster publishes ingress-nginx on
# host port 3400 and ingress-nginx routes by Host header (ignoring the port),
# and *.localhost names resolve to 127.0.0.1 natively (RFC 6761) — so every
# instance shares port 3400 under a distinct hostname with no extra port
# mappings and no cluster changes. Pattern and rationale mirrored from
# fernfiles' scripts/lib/dev-env.sh — see its comments for the full story
# (issue #181 / docs/specs/026-worktree-dev-instances/plan.md over there).
#
# Identity:
#   main checkout      -> namespace gpupoet-dev,        host gpupoet.localhost
#   worktree <name>    -> namespace gpupoet-dev-<name>, host gpupoet-<name>.localhost
#   GPUPOET_DEV_INSTANCE=<name> overrides; set it empty to force the main identity.
#
# Requires $workspace_root to be set by the sourcing script. Sets:
#   dev_instance dev_namespace app_host app_port base_url liveness_url
#   kube_context main_checkout_root dev_log_file

app_port="3400"
kube_context="kind-kind"

# In a worktree, --git-common-dir points at the main checkout's .git while
# --git-dir points inside .git/worktrees/<name>; in the main checkout the two
# are the same directory.
_git_dir=$(git -C "$workspace_root" rev-parse --path-format=absolute --git-dir)
_git_common_dir=$(git -C "$workspace_root" rev-parse --path-format=absolute --git-common-dir)
main_checkout_root=$(cd "$_git_common_dir/.."; pwd)

if [[ -n "${GPUPOET_DEV_INSTANCE+x}" ]]; then
    dev_instance="$GPUPOET_DEV_INSTANCE"
elif [[ "$_git_dir" == "$_git_common_dir" ]]; then
    dev_instance=""
else
    dev_instance=$(basename "$workspace_root")
    # Worktree dirs are conventionally named gpu-poet-<something>; strip the
    # repo-name prefix so the namespace reads gpupoet-dev-<something> rather
    # than gpupoet-dev-gpu-poet-<something>. Keep the full basename when
    # stripping would leave nothing (a worktree named exactly "gpu-poet" must
    # not collide with the main checkout's identity).
    _stripped="${dev_instance#gpu-poet-}"
    if [[ -n "$_stripped" && "$_stripped" != "$dev_instance" ]]; then
        dev_instance="$_stripped"
    fi
fi

# Namespace and hostname share the sanitized name, so it must be a valid DNS
# label: lowercase alphanumerics and '-', no leading/trailing '-', and
# "gpupoet-dev-<name>" must stay within the 63-char label limit.
if [[ -n "$dev_instance" ]]; then
    dev_instance=$(printf '%s' "$dev_instance" \
        | tr '[:upper:]' '[:lower:]' \
        | sed -E 's/[^a-z0-9-]+/-/g; s/-+/-/g; s/^-+//; s/-+$//' \
        | cut -c1-49)
    dev_instance="${dev_instance%-}"
fi

if [[ -n "$dev_instance" ]]; then
    dev_namespace="gpupoet-dev-${dev_instance}"
    app_host="gpupoet-${dev_instance}.localhost"
else
    dev_namespace="gpupoet-dev"
    app_host="gpupoet.localhost"
fi

base_url="http://${app_host}:${app_port}"

# This machine's LAN IPv4, or empty when there is no default route (offline).
# Best-effort and never fatal: everything that uses it degrades to
# localhost-only access.
detect_lan_ip() {
    local iface ip=""
    iface=$(route -n get default 2>/dev/null | awk '/interface:/ {print $2; exit}')
    if [[ -n "$iface" ]]; then
        ip=$(ipconfig getifaddr "$iface" 2>/dev/null || true)
    fi
    if [[ -z "$ip" ]]; then
        for iface in en0 en1 en2; do
            ip=$(ipconfig getifaddr "$iface" 2>/dev/null || true)
            [[ -n "$ip" ]] && break
        done
    fi
    printf '%s' "$ip"
}

# The hostname another device on the LAN reaches this instance by.
#
# nip.io resolves *.<ip>.nip.io to <ip>, which is the whole trick: k8s rejects
# a bare IP as an Ingress host, and ingress-nginx routes by Host header, so a
# phone needs a *name* that both resolves to this machine and carries the
# instance identity.
lan_host_for() {
    local ip="$1"
    if [[ -n "$dev_instance" ]]; then
        printf 'gpupoet-%s.%s.nip.io' "$dev_instance" "$ip"
    else
        printf 'gpupoet.%s.nip.io' "$ip"
    fi
}

liveness_url="${base_url}/api/health/liveness"
dev_log_file="$workspace_root/.dev-server.log"

# Writes the gitignored k8s/overlays/dev-instance/ overlay for this checkout's
# instance and ensures the gitignored .env.dev.app secret exists (copied from
# the main checkout when a worktree lacks it). Called by scripts/dev only.
generate_dev_instance_overlay() {
    local overlay_dir="$workspace_root/k8s/overlays/dev-instance"
    local env_app="$workspace_root/k8s/overlays/dev/.env.dev.app"

    if [[ ! -f "$env_app" ]]; then
        local main_env_app="$main_checkout_root/k8s/overlays/dev/.env.dev.app"
        if [[ -f "$main_env_app" ]]; then
            echo "Copying gitignored .env.dev.app from the main checkout ($main_checkout_root)"
            cp "$main_env_app" "$env_app"
        else
            echo >&2 "ERROR: $env_app not found (and no copy in the main checkout at $main_env_app)."
            echo >&2 "Create it from k8s/overlays/dev/.env.dev.app.example first."
            return 1
        fi
    fi

    mkdir -p "$overlay_dir"

    # A second host rule for this machine's LAN address, so a phone on the same
    # wifi reaches this instance without a manual `kubectl patch` that the next
    # skaffold deploy would overwrite. Written at every start, so moving between
    # networks re-derives it. Omitted entirely when there is no LAN IP.
    #
    # Backend port is the "web-ui" named port (k8s/base/app-service.yaml), not
    # $app_port — $app_port (3400) is the host port the kind node publishes for
    # ingress-nginx, unrelated to the app Service's own internal port (3000).
    local lan_ip lan_host lan_rule=""
    lan_ip=$(detect_lan_ip)
    if [[ -n "$lan_ip" ]]; then
        lan_host=$(lan_host_for "$lan_ip")
        lan_rule=$(cat << END_LAN_RULE

      - op: add
        path: /spec/rules/-
        value:
          host: $lan_host
          http:
            paths:
              - path: /
                pathType: Prefix
                backend:
                  service:
                    name: app
                    port:
                      name: web-ui
END_LAN_RULE
        )
    fi

    cat > "$overlay_dir/kustomization.yaml" << END_KUSTOMIZATION
# GENERATED by scripts/dev for dev instance '$dev_namespace' — do not edit.
# This directory is gitignored; it is rewritten on every scripts/dev start so
# it always matches the checkout it lives in. It layers the per-instance
# namespace and hostname over k8s/overlays/dev (whose secretGenerator env
# paths resolve relative to that directory, so the dev overlay is unchanged).
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization
namespace: $dev_namespace
resources:
  - ../dev
patches:
  - target:
      kind: Ingress
      name: gpupoet-app-ingress
    patch: |-
      - op: replace
        path: /spec/rules/0/host
        value: $app_host$lan_rule
END_KUSTOMIZATION

    cat > "$overlay_dir/namespace.yaml" << END_NAMESPACE
# GENERATED by scripts/dev for dev instance '$dev_namespace' — do not edit.
# Deliberately NOT listed in kustomization.yaml's resources: scripts/dev
# applies this file directly so the namespace stays outside skaffold's render
# and skaffold's cleanup can never delete it. Namespace deletion cascades to
# the DB StatefulSet's PVC (ignoring retention policies) and wipes this
# instance's dev data.
apiVersion: v1
kind: Namespace
metadata:
  name: $dev_namespace
END_NAMESPACE

    if [[ -n "$lan_rule" ]]; then
        echo "LAN access (phones on the same wifi): http://${lan_host}:${app_port}"
    else
        echo "No LAN IP found; this instance will be reachable from this machine only."
    fi
}

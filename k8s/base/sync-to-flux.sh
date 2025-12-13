#!/bin/bash
# Syncs k8s/base files to the flux repo using rsync.
# --delete removes any files in destination that don't exist in source.
set -euo pipefail

src_dir="$(dirname "$0")/"
dest_dir="/Users/scott/src/activescott/home-infra-k8s-flux/apps/base/gpupoet/"

echo "Syncing k8s/base files to flux repo..."
echo "  Source: $src_dir"
echo "  Destination: $dest_dir"

rsync -av --delete --include="*.yaml" --exclude="*" "$src_dir" "$dest_dir"

echo "Done."

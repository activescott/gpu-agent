# Memory-Aware Value Ranking — Design Spec

## Problem

The site's AI value rankings (`$/INT8 TOP`, `$/TFLOP`) treat an 8GB card and a
24GB card as interchangeable so long as throughput-per-dollar matches. For AI
inference and training, **VRAM capacity is usually the gate that decides whether
a model runs at all**. A card that looks "expensive" on `$/TOP` can be the only
affordable option once the model needs the memory (the RTX 3090 is the poster
child — great VRAM/bandwidth, mediocre `$/compute`, invisible in every current
ranking).

Goal: rank GPUs by value **for a chosen workload defined by model parameter size
+ quantization**, gating on whether the model fits in VRAM and (for inference)
crediting memory bandwidth and MoE active-parameter sparsity.

Non-goal (this spec): measured LLM inference benchmarks. We have none, and
building a benchmark harness is out of scope. All compute/throughput numbers are
**spec-derived** (roofline), which is transparent and defensible.

## Key domain principles

1. **VRAM is a threshold, not a linear good.** Never rank by `$/(compute×GB)` —
   that flatters big-VRAM cards on workloads where the capacity sits idle. Model
   VRAM as a hard fit test, then rank the survivors by `$/compute`.
2. **Presets are synthetic, not model-bound.** The workload is a
   `(parameterSize, quantization, mode)` tuple, NOT a named model. Required VRAM
   is computed `params × bytesPerParam × overhead (+ KV/optimizer)`. This means
   **no dependency on the `data/model-data` YAMLs** (which only cover ~10 mostly
   <8B dense models and have no MoE/active-param field — see Data Findings).
3. **Dense vs MoE splits fit from speed.** For MoE, the **fit test uses TOTAL
   params** (all experts must be resident) while **throughput uses ACTIVE
   params** (only routed experts run per token). A preset therefore carries both
   a total and an active parameter count; dense presets set active = total.
4. **Inference decode is memory-bandwidth-bound.** For a model that fits, decode
   tokens/sec ≈ `memBandwidth / activeParamBytes`. This makes bandwidth
   (`gpu.memoryBandwidthGBs`, already stored) a first-class term and is what lets
   the 3090 and MoE models show their real advantage.

## Preset dimensions

### Parameter sizes (recommended, anchored to real releases)

`1B, 3B, 8B, 14B, 32B, 70B, 120B, 235B (MoE), 405B, 671B (MoE), 1T (MoE)`
plus optional `2.8T (frontier, speculative)` behind an "advanced" flag.

Adjustments from the requested list (`2B,7B,13B,20B,30B,70B,100B,120B,400B,1T,2.8T`):
- `7B → 8B` (matches Llama-3/3.1/Qwen2.5), `13B → 14B`, `30B → 32B`, `400B → 405B`
  (Llama-3.1 405B), `100B → 120B`.
- Drop `2B` (covered by 1B/3B) and `20B` (covered by 14B/32B).
- Add `235B` (Qwen3-235B MoE) and `671B` (DeepSeek-V3/R1 MoE) as the flagship MoE
  anchors — they make the total-vs-active story concrete.
- Keep `2.8T` only as a labeled-speculative "frontier" bucket.

Many sizes won't fit any single consumer card — that is the point; the wall is
the message.

### Quantization levels

Primary (ship these three): **FP16/BF16 = 2 B/param**, **8-bit (FP8/INT8/Q8) =
1 B/param**, **4-bit (INT4/Q4_K_M) ≈ 0.5 B/param**.

Advanced (behind a toggle): 6-bit (Q6_K ≈ 0.75), 5-bit (Q5_K_M ≈ 0.65), 3-bit
(≈ 0.4, label experimental). FP32 (4 B/param) is training-master only, not an
inference preset.

### Mode

- **Inference** (default)
- **Fine-tune: LoRA/QLoRA**
- **Fine-tune: Full**

## VRAM requirement formulas (must be surfaced in the UI, not hidden)

Let `P = totalParamsB × 1e9`, `b = bytesPerParam(quant)`.

- **Inference:** `VRAM ≈ P·b·1.2 + KV`
  - `1.2` = fixed overhead (CUDA context, activations, fragmentation), stated.
  - **v1: omit KV from the fit gate**; show it as a separate "+ context" estimate
    with a documented assumption (4K tokens, batch 1) to avoid false precision.
    Add KV to the gate in v2.
- **LoRA/QLoRA fine-tune:** `VRAM ≈ P·b·1.2 + adapter/optimizer(~1.3×)` → use a
  single stated multiplier ≈ `P·b·1.6`. (Base weights can be 4-bit for QLoRA.)
- **Full fine-tune:** `VRAM ≈ weightsBytes × ~16` (FP16 weights + FP32 master +
  Adam m/v + gradients). Stated multiplier; most consumer buyers only care about
  LoRA/QLoRA.

### Required-GB reference (inference, weights×1.2, KV excluded)

| Params | FP16 | 8-bit | 4-bit |
|---|---|---|---|
| 1B | 2.4 | 1.2 | 0.6 |
| 3B | 7.2 | 3.6 | 1.8 |
| 8B | 19.2 | 9.6 | 4.8 |
| 14B | 33.6 | 16.8 | 8.4 |
| 32B | 76.8 | 38.4 | 19.2 |
| 70B | 168 | 84 | 42 |
| 120B | 288 | 144 | 72 |
| 235B (total) | 564 | 282 | 141 |
| 405B | 972 | 486 | 243 |
| 671B (total) | 1610 | 805 | 402 |
| 1T | 2400 | 1200 | 600 |

(For MoE the fit column uses TOTAL params, as shown.)

## The value metrics

For a chosen preset, compute per GPU (only for GPUs that FIT, i.e.
`gpu.memoryCapacityGB ≥ requiredGB(preset)`):

### v1 — VRAM-gated `$/spec-compute` (cheap, ship first)
- Inference: rank fitting GPUs by existing `$/INT8 TOP` (`bestDeal / int8TOPS`).
- Training: rank fitting GPUs by `$/FP16 TFLOP` (`bestDeal / fp16TFLOPS`).
- The preset only changes the **population** (the VRAM floor). Reuses the existing
  best-deal CTE and the existing memory filter verbatim.

### v2 — inference roofline `tokens/sec per dollar` (flagship, MoE-aware)
- `tokensPerSec ≈ (memoryBandwidthGBs × 1e9) / (activeParamsB × 1e9 × b)`
  = `memoryBandwidthGBs / (activeParamsB × b)`.
- `value = tokensPerSec / bestDeal` (higher is better).
- Uses **active** params (MoE-aware speed) for throughput and **total** params
  for the fit gate. This single metric encodes both of the user's asks
  (memory-aware + dense/MoE) and gives the 3090 credit for its 936 GB/s.
- Worked example: 3090 (936 GB/s), 8B @ 4-bit → `936/(8×0.5)=234 tok/s`; at a
  $990 best deal ≈ `0.24 tok/s per $`. A Qwen3-235B MoE (22B active) @ 4-bit
  runs at `936/(22×0.5)=85 tok/s` **if it fits** — but needs 141GB, so the 3090
  is gated out, illustrating the fit-vs-speed split.

Recommendation: build v1 first (nearly free), then v2 as the headline. Training
stays on v1 `$/TFLOP` (training is compute-bound; bandwidth roofline doesn't
apply cleanly).

## Dense-vs-MoE axis (the user's "MoE axis for benchmarks")

Because we have **no measured LLM benchmarks**, the MoE axis is not a benchmark
column — it is expressed in the preset + the roofline metric:
- Preset carries `{ totalParamsB, activeParamsB }`. Dense ⇒ equal. MoE ⇒ active <
  total.
- Fit gate uses `totalParamsB`; roofline throughput uses `activeParamsB`.
- UI: a **Dense / MoE toggle**; MoE reveals an "active parameters" selector (or
  presets Mixtral-8x7B 47B/13B, Qwen3-235B 235B/22B, DeepSeek-V3 671B/37B).

**Other active-parameter-limiting techniques** (for the article + future axes,
not v1): Mixture-of-Depths (per-token layer skipping), activation sparsity
(ReLU-family / Deja Vu / PowerInfer), early-exit. All generalize to a single
"active fraction" ≤ 1; MoE is the labeled flagship. Speculative decoding and 2:4
structured sparsity are throughput/compute tricks, NOT active-param reductions —
mention but keep off the active-param axis.

If we later want *real named-model* MoE presets, add `activeParameterCount`
(number) to `data/model-data/model-spec.schema.json` and make `parameterCount`
numeric — out of scope here since presets are synthetic.

## Data findings (from codebase survey)

Chart internals (`src/pkgs/server/components/charts/`):
- Best-deal price = 3-cheapest-active CTE, identical in `DollarsPerInt8TopChart.tsx`
  and `DollarsPerTflopChart.tsx` (active-during-window on `Listing`). Reuse verbatim.
- INT8 comes from `GpuMetricValue metricSlug='int8-tops'`; FP32 from `gpu.fp32TFLOPS`
  column; **VRAM is `GpuMetricValue metricSlug='memory-gb'`**.
- **`DollarsPerTflopChart` already gates VRAM** via `INNER JOIN … memory-gb` +
  `mem.value ≥ 16`. Our VRAM gate is the same pattern with a parameterized floor.
- `memoryBandwidthGBs` exists on `gpu` (Prisma `schema.prisma` model `gpu`,
  legacy col) — available for the roofline.
- Chart registration: add component + `getXxxConfig` to
  `charts/index.ts` `chartConfigFetchers`, add `CHART_HASHTAGS` in `types.ts`;
  the OG image route `/api/images/chart/[componentName]` then works automatically.
- `PriceHistoryChart` is the template for a chart that takes an extra prop
  (`gpus?: string[]` → SQL `= ANY(...)`); mirror it to thread a `requiredGb` /
  preset prop.

Routing / rankings (`src/app/gpu/ranking`, `src/app/gpu/price-compare`):
- Metric system is **DB-driven from `data/metric-definitions/specs.yaml`** →
  seeded to `MetricDefinition` + `GpuMetricValue`. Both dynamic routes resolve
  ANY slug present in the DB; a new *single-per-GPU* spec metric needs only a
  YAML entry + reseed, no code.
- **A `(model-size × quant)` ranking does NOT fit the single-slug metric model**
  (value is per-(gpu,preset), combinatorial). Two options:
  1. **Filter-only MVP (cheapest):** the existing client filter scheme
     (`filter.memoryCapacityGB[gte]=<floor>`, `packages/filter-items`) already
     filters GPUs by VRAM, and AI ranking pages already default
     `memoryCapacityGB ≥ 10` (`RankingPageWithFilters.tsx`). A preset selector
     that maps `(paramSize, quant, mode) → requiredGb` and writes
     `filter.memoryCapacityGB[gte]` on top of the existing `$/INT8 TOP`
     price-compare page delivers v1 with almost no new server code.
  2. **Dedicated route (flagship):** new
     `app/gpu/ranking/ai/model-runner/…` (query-param preset) computing the
     roofline value per fitting GPU; reuses `RankingPageWithFilters`,
     `gpuFilterConfig`, the `filter.*` URL scheme, and the table/gallery
     components. Add a `modelRunnerSitemap` enumerating preset URLs in
     `src/app/sitemap.ts`.

Learn articles (`src/app/gpu/learn`):
- Existing quantization article: **`/gpu/learn/ai/quantization`** (title
  "Quantization in Machine Learning and Deep Learning") — link target for the
  "learn more". Existing params/VRAM math article:
  `/gpu/learn/ai/faq/how-much-gpu-memory-for-llm`.
- New article = folder `src/app/gpu/learn/ai/<slug>/page.mdx` with an H1
  (title derives from H1), then re-run `src/scripts/gen-sitemap.ts`
  (writes `sitemap.static-pages.json`). To surface it on the AI index, add its
  path prefix to the filter in `src/app/gpu/learn/ai/page.tsx` (the "GPU
  Specifications" list is a hardcoded prefix match on `quantization`/
  `form-factors`).
- MDX = async server components; footnotes via `remark-gfm` `[^1]`; links via
  `next/link` or markdown; `Feature` component for callouts.

## Educational article outline (`/gpu/learn/ai/model-parameters-and-quantization`)

1. **What is a parameter** — weights; scale → capability AND memory cost.
2. **Bytes per parameter / quantization** — 2 sentences + "Learn more" link to
   `/gpu/learn/ai/quantization`. The `params × bytesPerParam` rule with a table.
3. **Why VRAM is a hard wall** — fit-or-fail; the offload cliff (10–50× slower).
4. **Total vs active parameters (Dense vs MoE)** — why two "same-size" models
   benchmark differently: MoE holds all experts in VRAM (total) but runs only a
   few per token (active), so it needs big memory yet decodes fast. Concrete
   anchors: Mixtral 8x7B (47B/13B), DeepSeek-V3 (671B/37B).
5. **Related ideas (brief)** — Mixture-of-Depths, activation sparsity; note
   speculative decoding and 2:4 sparsity are different (throughput/compute, not
   active-param).
6. **Cross-link** to the new memory-aware ranking and to
   `how-much-gpu-memory-for-llm`.

## Open decisions for Scott

1. **KV cache in v1 fit gate** — recommend excluded (separate estimate). OK?
2. **Route strategy** — recommend Filter-only MVP (Phase 1) → Dedicated roofline
   route (Phase 2). OK, or go straight to the dedicated route?
3. **MoE in v1** — recommend preset config `{total, active}` (no schema change).
   Confirm we are NOT adding named-model MoE presets yet.
4. **Frontier `2.8T`** — include as labeled-speculative, or drop?
5. **Training modes** — ship LoRA/QLoRA only in v1, add Full later? Or both now?

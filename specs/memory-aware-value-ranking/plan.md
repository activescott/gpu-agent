# Memory-Aware Value Ranking — Implementation Plan

See `spec.md` for the full design, formulas, and codebase findings. This plan is
phased so each phase ships independently. Phase 0 and Phase 1 are the smallest
useful increments; Phase 2 is the flagship.

## Task 0 — Persist this plan
- [x] Save this plan to `specs/memory-aware-value-ranking/plan.md` and `spec.md`
  before writing code. (Done.)

## Phase 0 — Educational article (independent, ship anytime)
No data/route dependencies; can go out with the current market report cycle.

1. Create `src/app/gpu/learn/ai/model-parameters-and-quantization/page.mdx`
   with an H1 title (sitemap derives title from H1).
   - Sections per spec outline: parameters → quant (2-sentence + "Learn more"
     link to `/gpu/learn/ai/quantization`) → VRAM wall → total-vs-active
     (Dense/MoE) → related techniques → cross-links.
   - Include the `params × bytesPerParam` table and the Dense/MoE anchors
     (Mixtral 8x7B, DeepSeek-V3).
2. Surface it on the AI index: add its path prefix to the "GPU Specifications"
   filter in `src/app/gpu/learn/ai/page.tsx`.
3. Regenerate sitemap: run `src/scripts/gen-sitemap.ts` (updates
   `sitemap.static-pages.json`).
4. Verify: `npx tsc --noEmit`; load `/gpu/learn/ai/model-parameters-and-quantization`
   on the dev server; confirm it appears on `/gpu/learn/ai` and in the sitemap.

## Phase 1 — Preset config + VRAM math + MVP ranking (filter-driven)
Cheapest path to a working memory-aware ranking; reuses existing filter scheme.

5. Add preset config module `src/pkgs/isomorphic/model/modelRunnerPresets.ts`:
   - `PARAM_SIZES` (spec list, each `{ label, totalParamsB, activeParamsB, isMoE, speculative? }`).
   - `QUANT_LEVELS` (`{ label, bytesPerParam, advanced? }`).
   - `MODES` (`inference | lora | full`) with overhead/multiplier constants.
   - `requiredGb(totalParamsB, bytesPerParam, mode)` per spec formulas (KV
     excluded in v1; expose a separate `kvEstimateGb(paramsB, contextTokens, batch)`).
   - Unit tests for `requiredGb` against the spec reference table.
6. Add a client `ModelRunnerPresetSelector` component (param size + quant + mode
   + Dense/MoE toggle). On change it computes `requiredGb` and updates the URL
   filter `filter.memoryCapacityGB[gte]=<requiredGb>` using the existing
   `updateURLWithFilters` (`packages/filter-items/src/urlUtils.ts`).
   - Show the computed requirement inline ("Needs ≈ X GB VRAM") + the KV note.
7. Mount the selector on the AI `$/INT8 TOP` price-compare page (inference) and
   `$/FP16 TFLOP` (training) — i.e. it drives the existing ranking population.
   No server changes; ranking metric unchanged.
8. Verify: `npx tsc --noEmit` + unit tests; on dev server pick 70B/4-bit and
   confirm only ≥42GB cards remain; pick 8B/FP16 and confirm the 3090 and 16–24GB
   cards qualify while 8GB cards drop.

## Phase 2 — Flagship roofline chart + dedicated route (MoE-aware)
9. New chart `src/pkgs/server/components/charts/ModelRunnerValueChart.tsx`:
   - Copy the best-deal CTE from `DollarsPerInt8TopChart.tsx`.
   - INNER JOIN `GpuMetricValue metricSlug='memory-gb'` gated by a `requiredGb`
     prop (thread it like `PriceHistoryChart`'s `gpus` → SQL param).
   - Pull `gpu.memoryBandwidthGBs`; compute
     `tokensPerSec = memoryBandwidthGBs / (activeParamsB × bytesPerParam)` and
     `value = tokensPerSec / bestDeal`; `ORDER BY value DESC LIMIT 15`.
   - Export `getModelRunnerValueConfig`; register in `charts/index.ts`
     (`chartConfigFetchers`) + `CHART_HASHTAGS` (`types.ts`). OG image route then
     works automatically.
10. New route `src/app/gpu/ranking/ai/model-runner/page.tsx` (query-param preset:
    `?params=70B&quant=4bit&mode=inference&active=…`):
    - Resolve preset from query, compute `requiredGb` + `activeParamsB`.
    - Reuse `RankingPageWithFilters` + `gpuFilterConfig` + `MetricSelector`
      shell; render `ModelRunnerValueChart` (or the ranked table) for fitting
      GPUs. Mount `ModelRunnerPresetSelector`.
11. Sitemap: add `modelRunnerSitemap` in `src/app/sitemap.ts` enumerating the
    preset URL matrix (param × quant × mode; cap the combinatorics to the primary
    quant levels + inference to avoid bloat).
12. Verify: `npx tsc --noEmit`; dev server — confirm 3090 ranks well on 8B/4-bit
    inference (bandwidth credit) and is correctly gated out of 235B-MoE/4-bit
    (needs 141GB); confirm MoE toggle changes throughput (active) but not the fit
    (total).

## Phase 3 — (Optional / future) real named-model MoE presets
13. If we later want named-model presets: add `activeParameterCount` (number) and
    make `parameterCount` numeric in
    `data/model-data/model-spec.schema.json` + Zod `MlModelSchema`
    (`src/pkgs/isomorphic/model/mlModel.ts`); backfill YAMLs; add a MoE model.
    Not required for synthetic presets.

## Cross-cutting
- Link the article ⇄ ranking both ways.
- Update the August-2026 market report's "memory-aware ranking" paragraph to
  point at the shipped ranking + article once live (currently points at
  `/contact`).
- Keep all formulas/assumptions visible in the UI (overhead 1.2, KV note, MoE
  total-vs-active) — transparency is the credibility.

## Quick commands
- Typecheck: `cd packages/web-app && npx tsc --noEmit`
- Dev server + prod data: `scripts/dev` then `scripts/restore-prod-db`
- Regenerate sitemap: run `packages/web-app/src/scripts/gen-sitemap.ts`
- Reseed (only if adding a real DB metric slug): `scripts/reseed`

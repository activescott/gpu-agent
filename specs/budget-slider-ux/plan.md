# Plan: Improve Budget Slider UX

## Context

Users are rage-clicking the Budget price slider on GPU price comparison pages (confirmed via PostHog session replays — rage clicks land on `<input class="form-range">` and the operator `<select>`). The root cause: on a $0–$12,500 range mapped to ~250px of track, each pixel spans ~$50, making it nearly impossible to land on a specific target value like $1,000 or $2,000. The slider only shows 3 tick marks (min, midpoint, max), providing no visual anchors at common budget thresholds.

**Goal:** Make the Budget filter easy to use precisely. Ship the improved UI directly (no A/B test) and monitor rage-click metrics post-launch.

## Design: "Slider + Presets + Text Input"

Keep the slider for coarse exploration, but add two new interaction modes:

1. **Preset quick-select buttons** — a row of small buttons at common budget values ($500, $1000, $1500, $2000, $3000, $5000). One click jumps to that value. Active preset is visually highlighted.

2. **Click-to-edit text input** — the current value display (`≤ $2,000`) becomes clickable. Clicking it morphs into a number input where the user types an exact value. On Enter/blur, the value is snapped to the nearest step and clamped to [min, max].

Both features are driven by the existing `NumericFilterConfig` — a new optional `presets` field controls whether presets render. No presets = slider-only (other numeric filters like Memory/TDP are unaffected unless presets are added later).

## Implementation Steps

### Step 1: Add `presets` to `NumericFilterConfig` type

**File:** `packages/filter-items/src/types.ts`

Add to `NumericFilterConfig` interface (~line 73):
```typescript
presets?: number[]
```

### Step 2: Update `NumericFilter` component

**File:** `packages/filter-items/src/NumericFilter.tsx`

Add an optional `onTrack` prop for analytics:
```typescript
onTrack?: (interactionType: string, value: number) => void
```

New UI elements (always rendered when config has presets):

- **Preset buttons:** Render a `d-flex flex-wrap gap-1 mb-2` row of `btn btn-sm btn-outline-secondary` buttons. Filter out presets outside `[min, max]`. Highlight active preset with `btn-secondary`. On click: `onChange({ operator, value: preset })` + `onTrack?.("preset_click", preset)`.

- **Click-to-edit value:** Replace the static `<span>` display with a clickable element. On click, show `<input type="number" min={min} max={max} step={step}>`. On Enter/blur: snap to nearest step, clamp to range, call `onChange` + `onTrack?.("text_input", value)`. On Escape: cancel. Needs local state: `isEditing` (boolean) and `inputValue` (string).

- **Slider tracking:** Wrap existing `handleSliderChange` to also call `onTrack?.("slider_drag", value)`.

### Step 3: Thread `onTrack` through `FilterItems` → `FilterList`

**File:** `packages/filter-items/src/FilterItems.tsx`

Add to `FilterItemsProps`:
```typescript
onTrack?: (filterName: string, interactionType: string, value: number) => void
```

Pass through to `FilterList`, then into `NumericFilter`:
```tsx
<NumericFilter
  ...existing props...
  onTrack={onTrack ? (type, val) => onTrack(config.name, type, val) : undefined}
/>
```

### Step 4: Add presets to Budget filter config

**File:** `packages/web-app/src/components/gpu/gpuFilterConfig.ts`

Add `presets: [500, 1000, 1500, 2000, 3000, 5000]` to the Budget NumericFilterConfig in both:
- `buildListingFilterConfigs` (~line 332)
- `buildGpuFilterConfigs` (~line 68)

Presets outside the dynamic `[min, max]` range are filtered at render time in the component.

### Step 5: Add `FilterInteraction` analytics action

**File:** `packages/web-app/src/pkgs/client/analytics/reporter.ts`

Add to `AnalyticsActions` enum:
```typescript
FilterInteraction = "Filter Interaction"
```

### Step 6: Wire analytics in `ListingsWithFilters`

**File:** `packages/web-app/src/components/gpu/ListingsWithFilters.tsx`

1. Import `useAnalytics` + `AnalyticsActions`
2. Build `onTrack` callback: `trackAction(AnalyticsActions.FilterInteraction, { filter_name, interaction_type, value })`
3. Pass `onTrack` to `<FilterItems>`

### Step 7: Wire analytics in ranking page consumer

**File:** `packages/web-app/src/app/gpu/ranking/[category]/[metric]/RankingPageWithFilters.tsx`

Same analytics wiring as Step 6.

## Files Modified (Summary)

| File | Change |
|------|--------|
| `packages/filter-items/src/types.ts` | Add `presets?: number[]` to `NumericFilterConfig` |
| `packages/filter-items/src/NumericFilter.tsx` | Add preset buttons, click-to-edit input, `onTrack` prop |
| `packages/filter-items/src/FilterItems.tsx` | Thread `onTrack` prop through to `NumericFilter` |
| `packages/web-app/src/components/gpu/gpuFilterConfig.ts` | Add `presets` array to Budget filter configs |
| `packages/web-app/src/pkgs/client/analytics/reporter.ts` | Add `FilterInteraction` action |
| `packages/web-app/src/components/gpu/ListingsWithFilters.tsx` | Wire analytics `onTrack` callback |
| `packages/web-app/src/app/gpu/ranking/[category]/[metric]/RankingPageWithFilters.tsx` | Wire analytics `onTrack` callback |

## Verification

1. **Dev environment:** Start with `./scripts/dev`, navigate to `/gpu/price-compare`
2. **Presets:** Verify preset buttons render, clicking one updates slider + URL + display value
3. **Click-to-edit:** Click the value display, type a number, press Enter — value snaps to step, filter updates
4. **Edge cases:** Type value > max → clamps. Type value < min → clamps. Presets beyond dynamic max don't render. Escape cancels editing. Mobile layout wraps presets gracefully.
5. **No presets:** Other numeric filters (Memory, TDP) render slider-only as before
6. **Analytics:** Check browser network tab for PostHog `Filter Interaction` events with correct properties
7. **Screenshot:** `./scripts/screenshot http://localhost:3000/gpu/price-compare` to visually verify

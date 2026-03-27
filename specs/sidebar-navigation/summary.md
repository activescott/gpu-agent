# Sidebar Navigation & ML Route Migration - Summary

## What was done

### Part 1: ML Route Migration
- Moved 12 pages from `/ml/learn/*` to `/gpu/learn/ai/*`: 3 FAQ pages, 7 use-case pages, 1 models dynamic route, 1 quantization page
- Added permanent (308) redirects in `next.config.mjs` for all moved paths
- Updated internal links in moved MDX files (`/ml/learn/gpu/*` -> `/gpu/learn/card/*`, etc.)
- Updated canonical URLs in models page
- Updated sitemap (`sitemap.static-pages.json`, `sitemap.ts`, `gen-sitemap.ts`)
- Updated `/gpu/learn/ai/page.tsx` hub page filter from `/ml/learn` to `/gpu/learn/ai`
- Updated remaining `/ml/` references in `GpuInfo.tsx`, `ModelInfo.tsx`, and GPU learn card page
- Deleted entire `src/app/ml/` directory
- Updated e2e test URL for MDX table styling

### Part 2: Navigation Sidebar
- Created `SiteSidebar.tsx` with desktop persistent sidebar and mobile hamburger overlay
- Simplified `SiteHeader.tsx` to logo + centered search bar only
- Deleted `SiteHeaderClientComponents.tsx` and `SiteHeaderNavToggler.tsx`
- Modified root `layout.tsx`: sidebar outside container, content in `container-xl`
- Added sidebar SCSS styles (220px width, sticky nav, mobile toggle/backdrop/overlay)
- Enhanced `SearchTrigger.tsx`: bigger, centered, "Search GPUs..." text, always-visible kbd shortcut
- Active state uses sibling-aware matching to avoid false highlights on parent paths
- All sub-items always visible (not collapsed)

### Additional
- Created news article announcing the feature (`2026-03-07-sidebar-navigation.yaml`)
- All 94 e2e tests passing

## Commit
`b4906cc` - feat: add site-wide sidebar navigation and migrate /ml/learn/* to /gpu/learn/ai/*

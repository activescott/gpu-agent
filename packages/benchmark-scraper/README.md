# GPU Benchmark Scraper

A scraper for GPU benchmark data from OpenBenchmarking.org.

## Installation

```bash
cd packages/benchmark-scraper
npm install
npx playwright install chromium
```

## Usage

### Scrape All Benchmarks

```bash
npm run scrape
```

### Scrape Specific Benchmark

Counter-Strike 2:
```bash
npm run scrape:cs2
# or
npm run scrape -- --benchmark=cs2
```

3DMark Wild Life Extreme:
```bash
npm run scrape:3dmark
# or
npm run scrape -- --benchmark=3dmark
```

## Output

Benchmark data is saved to `../../data/benchmark-data/` as YAML files.

Example output file: `counter-strike-2-fps-3840x2160.yaml`

```yaml
benchmarkId: cs2
benchmarkName: Counter-Strike 2
configuration: "Resolution: 3840 x 2160"
configurationId: 7f22820f1e1d586f13d970f6604140c3d5037d4d
metricName: Frames Per Second (Average)
results:
  - gpuNameRaw: "ASUS NVIDIA GeForce RTX 5090"
    gpuNameMapped: "nvidia-geforce-rtx-5090"
    value: 554
  - gpuNameRaw: "NVIDIA GeForce RTX 4090"
    gpuNameMapped: "nvidia-geforce-rtx-4090"
    value: 425
scrapedAt: "2025-01-15T10:30:00.000Z"
```

## GPU Name Mapping

The scraper uses `src/gpu-name-mapping.yaml` to map GPU names from OpenBenchmarking to coinpoet GPU slugs.

When the scraper encounters an unmapped GPU, it will log a warning:

```
Unmapped GPUs found (add these to gpu-name-mapping.yaml):
  - "Some New GPU Model"
```

Add these to `src/gpu-name-mapping.yaml`:

```yaml
"Some New GPU Model": "some-new-gpu-model"
```

## Available Benchmarks

- `cs2` - Counter-Strike 2 (multiple resolutions)
- `3dmark` - 3DMark Wild Life Extreme

## Development

Build:
```bash
npm run build
```

Run without building:
```bash
npm run scrape
```

## How It Works

1. Scraper navigates to OpenBenchmarking.org test pages
2. Extracts configuration options (e.g., different resolutions)
3. For each configuration, navigates to the performance test page
4. Scrapes GPU names and benchmark values from the table
5. Maps GPU names using `gpu-name-mapping.yaml`
6. Saves data as YAML files in `data/benchmark-data/`

## Notes

- Scraper uses Playwright with Chromium browser
- Includes polite delays between requests (5 seconds)
- Uses realistic browser user-agent
- Validates output using Zod schemas

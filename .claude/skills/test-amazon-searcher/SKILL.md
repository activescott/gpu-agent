---
name: test-amazon-searcher
description: Iteratively test and debug the amazon-searcher microservice until GPU searches consistently return results. Use when amazon searches fail, return zero results, or Amazon changes their HTML structure.
---

# Test Amazon Searcher

Iteratively test and debug the amazon-searcher microservice (`packages/amazon-searcher/`).

## Prerequisites

- Dev environment running (`./scripts/dev`)
- Oxylabs credentials configured in `k8s/overlays/dev/.env.dev.app`

## Workflow

### Step 1: Run a test

If arguments were provided, use that GPU name. Otherwise pick a random GPU:

```bash
./scripts/test-amazon-searcher "$ARGUMENTS"
```

### Step 2: If the test returns >0 results, run 4 more tests

Space them ~30 seconds apart to avoid Amazon rate limiting. Use different GPUs:
- "NVIDIA GeForce RTX 5070 Ti"
- "NVIDIA GeForce RTX 5080"
- "AMD Radeon RX 9070 XT"
- "AMD Radeon RX 9070"
- "AMD Radeon RX 9060 XT"

**Goal**: 5 consecutive tests with >0 results and no errors.

### Step 3: If a test returns 0 results or an error, diagnose

The test script auto-saves debug artifacts to `/tmp/amazon-searcher-debug-local/<slug>/` on failure.

1. **Check if search results exist in the HTML**:
   ```bash
   grep -c 'data-component-type="s-search-result"' /tmp/amazon-searcher-debug-local/<slug>/page.html
   ```

2. **Check for bot detection**:
   ```bash
   grep -i 'sorry\|captcha\|robot' /tmp/amazon-searcher-debug-local/<slug>/page.html
   ```

3. **Test parser against saved HTML** — load the saved HTML with Cheerio in node to test which selector broke:
   ```bash
   cd packages/amazon-searcher && node -e "
   const fs = require('fs');
   const { load } = require('cheerio');
   const html = fs.readFileSync('/tmp/amazon-searcher-debug-local/<slug>/page.html', 'utf-8');
   const \$ = load(html);
   const results = \$('[data-component-type=\"s-search-result\"]');
   console.log('Search result elements:', results.length);
   results.each((i, el) => {
     if (i >= 3) return;
     const asin = \$(el).attr('data-asin');
     const h2 = \$(el).find('h2');
     console.log('ASIN:', asin, 'h2 aria-label:', h2.attr('aria-label'), 'h2 text:', h2.text().substring(0, 80));
   });
   "
   ```

4. **View the Playwright trace** for visual debugging:
   ```bash
   ./scripts/amazon-debug-trace <slug>
   ```

### Step 4: Common root causes and fixes

| Symptom | Cause | Fix |
|---------|-------|-----|
| "Sorry! Something went wrong!" page | Amazon rate-limited the proxy IP | Wait 30s+ between tests. In production (1 search per 10 min) this doesn't happen. |
| Non-USD prices (e.g., "PAB 739.99") | Proxy routing through non-US country | Ensure `cc-us` is in the Oxylabs username in `packages/amazon-searcher/src/proxy.ts` |
| HTML has search results but parser returns 0 | Selectors don't match current Amazon HTML | Test parser against saved `page.html` with Cheerio to find which selector broke |
| Title extraction fails | Amazon changed h2 structure | Check if `h2[aria-label]` still works. Amazon uses two layouts: single h2 with aria-label, or two h2s (brand + title) |
| Outdated user agents | Amazon may flag old browser versions | Update `packages/amazon-searcher/src/user-agents.ts` with current Firefox versions |

### Step 5: Fix, rebuild, retest

1. Edit code in `packages/amazon-searcher/src/`
2. Run `cd packages/amazon-searcher && npx vitest run` to verify unit tests pass
3. Save — Skaffold auto-rebuilds and redeploys (~60s)
4. Wait for new pod: `minikube kubectl -- -n gpupoet-dev get pods -l app=amazon-searcher -w`
5. Retest from Step 1

### Step 6: Repeat until goal is met

Keep iterating until 5 consecutive tests pass. Make one small change at a time — simpler is better. Avoid adding complexity when a straightforward fix exists. If you're not sure what's wrong, check the debug artifacts before guessing.

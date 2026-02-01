# Claude Code Instructions

This file contains instructions and context for Claude Code sessions working with this repository.

## Important Instructions

- Refer to @README.md for your memory, complete technical documentation, troubleshooting, and development workflow.
- Do not update this file, instead update @README.md to update your memory.
- Always use scripts/dev to start the dev environment:
  - Don't use minikube commands directly to start it.
  - Run `./scripts/dev` directly without output redirection - it provides all needed output
  - Don't redirect output (e.g., `> /tmp/file.log`) - it causes permission prompts
  - To stop: `./scripts/dev stop`
  - To restart: `./scripts/dev stop && ./scripts/dev`
  - The dev environment takes ~33s to start. Start it in background and use `sleep 33` right away.
- Always use `minikube kubectl` instead of bare `kubectl` for the correct context.
- Save all approved plans to `/Users/scott/src/activescott/gpu-poet-data/docs/plans/` with format `YYYY-MM-DD-plan-name.md`.
- **Taking screenshots**: Use `./scripts/screenshot <url> [output-dir]` to capture pages for visual verification. It auto-splits long pages into viewport-sized chunks. Dev environment must be running first. Use `SELECTOR='.my-class'` to capture a specific element.

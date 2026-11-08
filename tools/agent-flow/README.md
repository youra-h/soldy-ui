# Agent flow

Provider-independent ClickUp workflows for soxa-ui. MCP and the CLI run on Node.js with no extra runtime dependencies. Shared role instructions are plain English Markdown; Agent Skills provide portable entry points. No model or provider is selected by the workflow.

## Start here

1. Store a personal ClickUp token in the process environment as `CLICKUP_TOKEN`, or in the private user file `~/.config/soxa-agent-flow/credentials.json` as `{"CLICKUP_TOKEN":"pk_..."}`. Never commit it. `CLICKUP_CREDENTIALS_FILE` can select a different file. The environment wins. No runtime reads from provider settings.
2. `config.json` contains this project's Space/team/owner IDs and exact status names. `CLICKUP_CONFIG` may select another file. Space-wide queries include new lists; an empty spaceId selects listId instead. Never change Space statuses as part of client setup.
3. Run `npm run agent:setup` in the code checkout. It generates ignored `.codex/config.toml` with absolute local paths and installs `.githooks/commit-msg` through repository-local core.hooksPath. It refuses unrelated existing configuration instead of overwriting it. The commit hook enforces English messages and rejects Claude/Anthropic attribution for all Git clients. It does not claim to intercept arbitrary worktree commands.
4. Run `npm run agent -- doctor`: validates credentials with read-only requests and checks the planning queue and local pool. It prints counts, not task contents or the token.
5. Reload/restart the AI host to load a new MCP connection. Existing sessions may retain their old tool catalog. Use the CLI fallback until a fresh connection is available.

## Using commands

Codex: explicitly invoke `$plan <id>`, `$dev <id>`, `$drive <id>`, `$manage`, `$pool`, etc. `$plan` is the project skill, not the host's built-in `/plan`. Skills are in `.agents/skills/`; each reads the same provider-neutral [command reference](commands.md), [shared workflow](workflow.md) and relevant [role](roles/). Skills load only on explicit invocation.

Other agents: ask them to run the named command using commands.md, or print its entry instructions with `npm run agent -- prompt dev <id>`. The CLI prints instructions, not an LLM invocation. Tool names have no provider prefix in shared instructions; clients may namespace the connected MCP tools.

The root `.mcp.json` describes the standard stdio launch for clients that support that format, from the repository root:

```json
{ "mcpServers": { "clickup": { "command": "node", "args": ["tools/agent-flow/clickup-mcp.mjs"] } } }
```

For other clients configure command `node`, the absolute path to clickup-mcp.mjs, and the repository working directory. No credentials belong in that manifest. Codex's generated project configuration is a local adapter; the workflow, server, credentials and roles do not depend on it.

CLI fallback for a missing MCP connection:

```sh
npm run agent -- tools
npm run agent -- call clickup_get_task --input task.json
```

`task.json` contains `{"task_id":"<id>"}`. The same validation and tool implementation serve MCP and CLI. Call write tools only as part of the invoked workflow; merely printing a prompt or inspecting the pool does not claim a task.

## Workflow and preserved behavior

| Role      | Entry status                      | Outcomes                                                                        |
| --------- | --------------------------------- | ------------------------------------------------------------------------------- |
| analyst   | analysis                          | done -> planning; questions -> overview                                         |
| techlead  | planning                          | ready -> in progress; design -> design; questions -> overview; done -> approved |
| designer  | design                            | done -> approved; questions -> planning                                         |
| developer | in progress                       | done -> approved; questions -> overview                                         |
| manager   | planning / in progress / overview | guarded priority, dependency and status moves; never takes a task               |

Queues are urgent/high/normal/low, unset as normal, oldest first. Automatic selection skips busy and blocked tasks. Explicit IDs do not bypass the busy check. Owner simple/normal/hard tags govern report sizes, not permission to leave work unfinished. Only techlead can set a missing size. APPROVED is ready for owner review; only closed/done resolves blockers. Owner merge and closure remain manual.

Read comments before deciding; report before handoff. The server tags every comment part and retrieves all pages. Manager moves preserve the owner-reply, hold and dependency guards. Follow-up descriptions stay plain and owner-facing; plans are separate role comments, and new tasks enter overview. Full rules and report formats are in the role files.

## Existing worktree pool and leases

The pool remains sibling `soxa-*` Git worktrees, excluding soxa-conflicts. Its absence during restoration is temporary; the owner will restore the same names. No command creates worktrees, replacement clones or switches the main folder.

`pool` is read-only. `acquire <id> --write` atomically reserves the task and an existing suitable folder; no folder means failure before any ClickUp mutation. It prefers the existing task branch and preserves its unfinished work. Reader roles use `acquire <id>`. `drive` upgrades the same lease with `lease-workspace <token>` before its first writer stage. `release <token>` removes only recorded locks owned by that token. `unlock <id>` is for explicit owner-authorized recovery after a stopped run; it never changes task status or clears ClickUp on.

Local mkdir locks coordinate runs sharing this Git directory, not separate machines. The remote on tag still uses separate read/write API requests and is not globally atomic. Missing/unreadable blockers remain blocked. Unknown lock contents are never recursively deleted. Commands do not merge, rebase, force-push, publish packages or reset worktrees.

## Validation and migration

`npm run test:agent-flow` runs isolated REST/transport/workflow checks with mocked ClickUp writes and temporary repositories. `doctor` is the optional real read-only integration check. No live task transitions are needed to validate setup.

Previous provider commands, roles and hooks are replaced by the shared files, not kept as parallel aliases. Session-title customization was provider UI behavior and is not part of the portable workflow. The local migration backup is inside `.git`, never committed. Imported historical memory remains in the separate private memory-ai repository.

Release instructions are retained in [release.md](release.md) but require a separate owner request. This migration neither versions nor releases any package.

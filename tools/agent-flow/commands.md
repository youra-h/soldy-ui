# Commands

These are portable workflow names, not provider-specific slash commands. Read workflow.md and the relevant role. In Codex explicitly invoke `$dev <id>`, `$plan <id>` etc.; `$plan` is different from Codex's built-in `/plan`. A host may expose skills in a menu. In any other host, say `Run dev <id> using tools/agent-flow/commands.md`, or use `npm run agent -- prompt dev <id>` to print the entry instructions. The CLI does not start a model or silently execute a role.

## Single roles

| Command | Role      | Automatic queue                                    |
| ------- | --------- | -------------------------------------------------- |
| analyze | analyst   | analysis                                           |
| plan    | techlead  | planning                                           |
| design  | designer  | design                                             |
| dev     | developer | in progress                                        |
| manage  | manager   | board-wide; optional owner instruction, no task ID |

Run the role in a fresh context when the host supports delegation; an explicit role command authorizes that role, not extra parallel work. In a host without subagents, perform the same instructions in the current session. Keep model selection in the host; roles carry no provider-specific tool allowlists or model settings. Writer commands acquire an existing pool folder before claiming the task; none available means stop with no ClickUp mutations.

## analyze-all / plan-all / design-all / dev-all

Process the respective queue sequentially. Re-read it before each task, skip busy/blocked/already-visited IDs, and claim only the task being processed. A busy race skips that task. After each role, verify status changed and on cleared; writers must leave committed work and a PR when APPROVED. Stop the batch if handoff did not complete, unfinished work remains dirty, or workspace preparation fails. A normal questions outcome does not stop other independent tasks. The invocation that acquired each lease releases it before selecting the next task; delegated children never release an inherited lease. Never switch the main folder to a task branch or reset a folder to erase unfinished work. Report each ID, status, PR/check outcome and remaining blocked/busy tasks. Manager can resolve actual overlaps beforehand; do not invent manager runs automatically.

## drive [id]

Without ID choose from planning. Acquire the task lease once; route by current status: analysis -> analyst, planning -> techlead, design -> designer, in progress -> developer. Before the first writer stage, obtain a pool worktree through the lease upgrade command `lease-workspace <token>`; keep it until drive ends. Pass ID, lease token and absolute workspace to the role. Re-read task state after every stage. Stop at APPROVED, OVERVIEW, a busy task, unknown status, unchanged status or failed handoff. Stop on a missing worktree without creating replacements or claiming the writer stage. Read the relevant diff when an owner's conditional permission requires it. Report stages, final reason/status, PR/checks and workspace; release owned leases on normal stops, preserve them on an interrupted crash for explicit recovery.

## pool

Run `node tools/agent-flow/pool.mjs`. It only reads existing worktrees/locks, including missing registered paths. Report available, dirty, locked or absent folders. The owner will restore the same pool names later; do not create worktrees or alternative clones.

## unlock <id>

Use only after the owner explicitly says the previous run was stopped. Run `npm run agent -- unlock <id>` to release recorded local leases for that task. Preserve its branch and files. Report unrecognized legacy locks instead of deleting unknown directories. Read the ClickUp task: if on remains, state that the owner must clear it manually. Do not call handoff to clear on because that would change status. Do not stop unknown processes.

## week [date-range]

Read-only seven-day summary, or the requested period. Read GitHub releases and merged PRs for the period; exclude release PRs from double counting. If nothing released, identify pending changesets as unreleased. Group by consumer-visible behavior: components/fixes, breaking changes with upgrade guidance, theme, playground and tools. Finish with versions, merged PR count and pending changeset count. Return Russian Markdown; do not edit files or ClickUp.

## release

Only on a separate explicit release request. Read release.md and docs/agents/build.md. Never run as part of a migration, drive or dev task. There is no ClickUp task for a release.

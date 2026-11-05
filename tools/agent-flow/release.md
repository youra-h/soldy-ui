# Release preparation

This procedure is dormant until the owner explicitly requests a release. The current migration does not authorize one. Read docs/agents/build.md in full first; it governs current version/package rules.

Use an existing clean pool worktree, never switch the main folder or create a worktree. Check gh authentication, fetch origin and stop if an unfinished release branch already exists. Start release/next from origin/main only in the assigned workspace.

Inspect pending changesets: library fixed group shares a version; themes/icons version independently. No real changeset means no release: report that without changing versions. Do not infer a prerelease decision from earlier discussion; resolve version/channel questions before proceeding.

Run npm install --no-audit --no-fund and verify lock/manifests remain unchanged before versioning. Use npm run changeset:version; never hand-edit versions or CHANGELOG. Update root README's library status/component release entries when the library is released. Use the generated manifests as the version source.

Review exact bumped packages, dependency-only changes, removed changesets and playground invariants under build.md. Run required setup/version checks and formatting; failing checks block a release PR. Name the branch release/v<version>, or release/<first-package>@<version> for a theme/icon-only release.

Commit in English and open a Russian release PR with the generated changelog entries for every bumped package, not duplicate fixed-group copies. Use tools/release-notes/cli.mjs to preview notes when appropriate. Report versions, PR and checks. Owner merge triggers publication through release.yml; never run npm publish or changeset publish. Do not merge the release PR yourself.

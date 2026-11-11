# Release preparation

Run only after an explicit owner request. Read docs/agents/build.md first.

Use an existing clean pool worktree. Never switch the main folder or create a
worktree. Check GitHub authentication, fetch origin and inspect unfinished
release PRs. Start a release branch from origin/main in the assigned workspace.

Choose the requested scope: components, themes, icons or all. Run
`npm run release:plan -- <scope>` and inspect every bumped package. The component
fixed group shares one version; themes and icon packs version independently.
Dependency updates outside the selected scope block preparation. Preview all
before proposing a coordinated release. No pending changes means no release.

Run npm install --no-audit --no-fund and verify manifests and lock remain
unchanged before versioning. Use `npm run release:prepare -- <scope>`; never
hand-edit versions or CHANGELOG. The first stable graduation uses all and removes
the shared beta state. Subsequent releases are stable; a new prerelease needs a
separate owner decision.

Review .release/plan.json, exact version changes, dependency-only edits, consumed
changesets and the playground's unchanged version. Update README's library
status/component entries when releasing components. Run setup manifest/version
guards, release tooling tests, formatting, the full build and package checks.
CI on the release PR must pass, including consumer installation tests.

Name the branch release/v<version>, or release/<first-package>@<version> for a
theme/icon-only release. Commit in English and open a Russian release PR with
the generated notes for every scope. Components, themes and icons receive
separate GitHub Releases even if one coordinated PR graduates them together.

The owner merges release PRs. The workflow verifies the exact planned packages,
publishes to npm and verifies registry installation. Never run npm publish or
changeset publish locally, and do not merge the release PR yourself.

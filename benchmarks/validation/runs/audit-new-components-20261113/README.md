# New-component audit evidence, 2026-11-13

Start with the [Russian report](../../new-components-2026-11-13.md),
[54-row proof index plus six auxiliary rows](coverage-index.json),
[actual source phases and checksums](evidence-index.json), and
[final target axe review](a11y-target-review-final.json).

The audit is complete with a tracked Solid Breadcrumbs focus failure. Ordinary
functional tests and one parity step remain failed. Webc Avatar source/error
churn reproduces native Chromium img/UA-subtree retention in a fresh about:blank
page without library imports; the memory row remains a signal.

## Source phases

- e0c94a76c: original full pages/30-minute soak/one-minute leak control/sequential
  interaction command. Its strict result remains 23/24 because the Angular
  full-registry runner stopped at a non-target unsupported direction prop.
- 62ee161f3: separate full Angular recovery, 47 pages and three tours, plus
  memory controls/replay/heaps. Both positive and negative controls completed.
- 0f9009fa7: ordinary main merge, full isolated Chromium/WebKit and fresh parity.
  Remote WebKit additionally exposed an audit-test initial-focus readiness race.
- e37ecc835: test-only actual Catalog/Phones/Catalog focus waits before subsequent
  keyboard events. Complete Chromium/WebKit results are in the sibling
  readiness-full directory. The final Escape assertion is unchanged.
- The final delivery commit adds documents/evidence and bounds the English-comment
  scanner diff to its existing supported syntaxes. Its complete remote CI is
  checked live and reported in the PR; no recursive commit is made solely to
  embed its own commit hash.

Original e0c and 0f900 target reviews and 0f900 proof derivation are retained
separately. No failed attempt or incomplete original run is overwritten by a
successful supplement. See each command metadata for exact executable, args,
source/lock/build hashes, run IDs, timestamps and versions.

## Reproduce and inspect

From the repository root, on the appropriate frozen source commit:

```sh
npm run bench:validate -- audit-new-components-20261113 pages,soak,control,interaction
node tools/bench-validation/supplement-audit.mjs NEW-UNIQUE-ID pages angular
node tools/bench-validation/browser-audit.mjs NEW-UNIQUE-ID chromium
node tools/bench-validation/browser-audit.mjs NEW-UNIQUE-ID parity
```

Use unique IDs: collectors refuse overwriting command metadata. The executed
supplemental browser collector adds the Vitest JSON reporter for both engines;
its own hash and base collector hash are in each browser command record.
WebKit uses the configured Docker Playwright server on Windows. Keep measured
stages isolated from builds/browser tests; the separate recovery documents its
diagnostic concurrency and does not supply comparable cross-host timing.

The fresh about:blank image control and retainer collector are in the sibling
supplement directory. Preserve their executed bytes and collector hashes. Gzip
heap snapshots are real before/end churn captures; decompress to .heapsnapshot
for DevTools. Retainer traversal is bounded; exact Webc captures use different
CDP sessions, so native IDs are not treated as cross-session identity proof.

The optional native diagnostic task draft remains local pending an owner
decision and is excluded from both Git and the evidence manifest. Its payload
is not reproduced here.

## Byte preservation and derivation

Raw JSON, logs and compressed heaps are not formatter inputs. Git attributes
disable text/EOL conversion for this evidence tree. The pure-native redirected
log has UTF-16LE with BOM; its JSON is UTF-8. Encoding and SHA256 of every
versioned evidence file are explicit in the final bundle.

Derivation order after raw collection:

```sh
node benchmarks/validation/runs/audit-new-components-20261113/derive-a11y-review.mjs
node benchmarks/validation/runs/audit-new-components-20261113/derive-coverage.mjs
node benchmarks/validation/runs/audit-new-components-20261113/finalize-report.mjs
node benchmarks/validation/runs/audit-new-components-20261113/bundle-evidence.mjs
```

The initial report generator and copy editor retain the earlier draft process;
the finalizer is authoritative for the completed report. Journal derivation is
append-only and refuses a duplicate dated heading. Regenerating derived files
changes timestamps/hashes; verify the retained bundle before regeneration.
Full raw results remain authoritative when a derived label differs.

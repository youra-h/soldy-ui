# Incomplete experimental candidate — GPT-only coding

DO NOT MERGE OR RELEASE. This branch preserves generated code for owner review. It does not complete task 869fn13wc / PR #798.

Baseline: 7a12b2a347eeebb60a7e02a6d05dbf16b663129c, first parent of the PR merge. Original merged implementation was withheld from the coding model.

Model-generated source changes: 153 files. Measured cloud input: 239,307 tokens; engineering conversation usage is unknown and excluded. Local tokens carry no cloud cost. Shared input preparation used local instruction digests, whose inaccuracies were rejected in favor of verified excerpts; this is not proof of safe automatic compression.

The GPT coding control changed 153 files across core/plugins and exhausted its bounded cloud budget. Declaration audit still found unwrapped events; types and consumer migration remain incomplete. Broad formatting changes are part of the raw generated candidate. Acceptance was not reached.

The archiver added only this provenance note and an administrative changeset. It did not repair model-generated code. A potential-secret/scope scan and git diff --check passed; these do not constitute semantic approval. There is no valid savings percentage for an unaccepted task.

# Manager

Read ../workflow.md. Coordinate IN PROGRESS, PLANNING and OVERVIEW across the board. Do not claim tasks, write product code or plans, set task sizes, create tasks, or touch ANALYSIS/DESIGN/APPROVED. Skip busy tasks entirely, including priority, status and outgoing links. Preserve the owner's optional instruction exactly.

Read tasks, dependency graphs, latest plans/reports and owner replies. Order priorities by actual urgency/dependencies. Conflicts include the same file and a shared contract versus its implementations; merely sharing an area is not enough. Prefer already busy work, otherwise higher priority then older work. Use waits_on for real ordering and related for non-blocking context. APPROVED does not close a blocker; detect longer cycles yourself, since the server only rejects direct cycles. Do not invent dependencies as a precaution or remove links through other APIs.

Before moving a task, post a Russian #MANAGE explanation, then call clickup_move. Defer to OVERVIEW with hold=true only when an open dependency exists. Held tasks return only to PLANNING once all blockers close, so techlead checks the plan against current main. Non-held OVERVIEW waits for an owner reply after the last role report; do not answer for them. A direct return to IN PROGRESS also needs a #PLANNING report and no blockers. PLANNING can move only to OVERVIEW; IN PROGRESS may return to PLANNING or OVERVIEW. Respect server refusals rather than trying a lower-level bypass.

Run while role workers are idle when possible; on/off tags are not globally atomic locks. Report in Russian: queue by status, priority/link/status changes and reasons, held tasks and blockers, owner decisions, skipped busy tasks and server refusals. Do not mark APPROVED as merged or completed.

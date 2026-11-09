/** A cell can contain several causes. Group observations, never count cells as bugs. */
export function classifyCell(cell, { participant, raw, negativeControl = false }) {
	const reference = {
		participant,
		raw,
		engine: cell.engine,
		component: cell.component,
		mode: cell.mode,
	}
	const findings = []
	const add = (category, cause, evidence, task = null) =>
		findings.push({ ...reference, category, cause, evidence, task })
	if (negativeControl) {
		add('intentional-negative-control', 'fixture', 'Explicit negative-control input')
		return findings
	}
	const soxa = participant === 'Soxa'
	const failure = cell.failure ?? ''
	if (cell.status === 'failed') {
		if (soxa && /restore calendar trigger focus/.test(failure))
			add(
				'harness-contract-mismatch',
				'datepicker-return-focus',
				'Original assertion requires opener; documented DatePicker returns to first field segment (docs/agents/patterns.md; plugins date-picker/focus).',
			)
		else if (
			soxa &&
			cell.component === 'select' &&
			cell.mode === 'narrow-touch' &&
			/waitFor.*Timeout/.test(failure)
		)
			add(
				'harness-contract-mismatch',
				'editable-select-text-touch',
				'Task 869fpezy6 targeted saved-build verification: text touch edits; arrow opens and Alpha 1 selects.',
			)
		else if (/Reduced-motion active animation exceeds 100ms/.test(failure))
			add(
				'harness-contract-mismatch',
				'duration-only-motion-rule',
				'Original runner checked duration without properties; no movement verdict can be recovered from durations. Corrected property audit requires a new observation.',
			)
		else if (
			soxa &&
			cell.component === 'select' &&
			/Unfinished IME Enter|Pending IME Enter/.test(failure)
		)
			add(
				'confirmed-component-defect',
				'select-ime',
				'Saved raw assertion records selection during unfinished composition; independently confirmed in task 869fpezy6.',
				'https://app.clickup.com/t/869fpezu0',
			)
		else if (cell.timedOut || /Timeout|exceeded.*ms/.test(failure))
			add('incomplete-check', 'completion-bound', failure)
		else if (!/axe violations/.test(failure)) add('unreviewed', 'behavior-assertion', failure)
	}
	for (const [state, audit] of Object.entries(cell.axe ?? {})) {
		for (const violation of audit.violations ?? []) {
			if (violation.id === 'region')
				add(
					'document-integration',
					'landmark-region',
					`${state}: axe region; host landmark context must be reviewed for every participant. Raw nodes and tags retained.`,
				)
			else if (
				soxa &&
				cell.component === 'select' &&
				violation.id === 'aria-required-children'
			)
				add(
					'confirmed-component-defect',
					'select-tags-aria',
					`${state}: raw axe aria-required-children; Tags defect independently confirmed in task 869fpezy6.`,
					'https://app.clickup.com/t/869fpezv5',
				)
			else
				add(
					'unreviewed',
					`axe-${violation.id}`,
					`${state}: ${violation.help}; raw nodes and tags retained.`,
				)
		}
		if (audit.incomplete?.length)
			add(
				'incomplete-check',
				'axe-manual-review',
				`${state}: ${audit.incomplete.map((v) => v.id).join(', ')}`,
			)
	}
	if (['not-run', 'not-applicable'].includes(cell.status))
		add('incomplete-check', 'coverage-gap', cell.reason ?? cell.status)
	return findings
}

export function groupCauses(findings) {
	const groups = new Map()
	for (const finding of findings) {
		if (
			finding.category === 'confirmed-component-defect' &&
			(!finding.evidence || !finding.task)
		)
			throw new Error('Confirmed defect requires evidence and task')
		const key = JSON.stringify([finding.participant, finding.category, finding.cause])
		if (!groups.has(key))
			groups.set(key, {
				participant: finding.participant,
				category: finding.category,
				cause: finding.cause,
				task: finding.task,
				observations: [],
			})
		groups.get(key).observations.push(finding)
	}
	return [...groups.values()]
}

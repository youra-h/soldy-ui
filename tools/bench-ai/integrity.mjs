const normalized = (value) =>
	Array.isArray(value)
		? value.map(normalized)
		: value && typeof value === 'object'
			? Object.fromEntries(
					Object.keys(value)
						.sort()
						.map((key) => [key, normalized(value[key])]),
				)
			: value
const canonical = (value) => JSON.stringify(normalized(value))
const completedStatuses = [
	'tested-with-failures',
	'tested-with-gaps',
	'compile-failed',
	'runtime-failed',
	'protocol-violation',
]

/** A saved result is incomplete if its process timed out, crashed or never reported an exit. */
export function checkExecution(execution, result) {
	const findings = []
	if (!execution || Array.isArray(execution)) findings.push('Missing process execution record')
	else {
		if (execution.error) findings.push(`Process error: ${execution.error}`)
		if (execution.signal) findings.push(`Process signal: ${execution.signal}`)
		const failed =
			['compile-failed', 'runtime-failed', 'protocol-violation'].includes(result?.status) ||
			result?.cells?.some((cell) => cell.status === 'failed')
		if (execution.originalExitCode !== (failed ? 1 : 0))
			findings.push(`Unexpected process exit: ${execution.originalExitCode}`)
	}
	if (!completedStatuses.includes(result?.status))
		findings.push(`Incomplete runner status: ${result?.status}`)
	return { status: findings.length ? 'incomplete' : 'complete', findings }
}
export const requiredHarnessFiles = [
	'run.mjs',
	'scenarios.mjs',
	'Page.vue',
	'Soxa.vue',
	'data.mjs',
	'vite.config.ts',
].map((name) => `tools/bench-ai/${name}`)

/** Unverified or altered inputs cannot contribute passed/failed observation counts. */
export function acceptObservation({
	component,
	metadata,
	observed,
	sourceHash,
	promptHash,
	execution,
}) {
	const invalid = Boolean(
		(metadata &&
			(metadata.component !== component ||
				metadata.promptHash !== promptHash ||
				(sourceHash && sourceHash !== metadata.sourceHash) ||
				(metadata.status === 'generated' && !sourceHash))) ||
		(observed &&
			(!metadata ||
				metadata.status !== 'generated' ||
				observed.sourceHash !== metadata.sourceHash)),
	)
	const completion = observed ? checkExecution(execution, observed) : null
	return {
		invalid,
		completion,
		status: invalid
			? 'invalid-input'
			: completion?.status === 'incomplete'
				? 'incomplete-execution'
				: (observed?.status ?? 'not-run'),
		results: invalid || completion?.status === 'incomplete' ? [] : (observed?.cells ?? []),
	}
}

/** Verifies comparison provenance; component failures remain valid observations. */
export function checkCohort(records, expectedCount = 11) {
	const findings = []
	const incomplete = []
	const reference = records.find((entry) => entry.name === 'Soxa') ?? records[0]
	const browsers = {}
	for (const { name, result, execution } of records) {
		const required = {
			commit: typeof result.commit === 'string' && result.commit.length > 0,
			libraryDirtyState: typeof result.libraryDirtyState === 'string',
			os: ['platform', 'release', 'arch', 'cpu'].every(
				(key) => typeof result.os?.[key] === 'string' && result.os[key].length > 0,
			),
			runtimeVersions: ['vue', 'vite', 'playwright', 'axe-core'].every(
				(key) =>
					typeof result.runtimeVersions?.[key] === 'string' &&
					result.runtimeVersions[key].length > 0,
			),
			lockHash: /^[a-f0-9]{64}$/.test(result.lockHash ?? ''),
			harnessSourceHashes:
				requiredHarnessFiles.every((file) =>
					/^[a-f0-9]{64}$/.test(result.harnessSourceHashes?.[file] ?? ''),
				) &&
				Object.values(result.harnessSourceHashes ?? {}).every((hash) =>
					/^[a-f0-9]{64}$/.test(hash),
				),
		}
		for (const [key, valid] of Object.entries(required)) {
			if (!valid) findings.push(`${name}: missing/invalid ${key}`)
			else if (reference && canonical(result[key]) !== canonical(reference.result[key]))
				findings.push(`${name}: ${key} differs from ${reference.name}`)
		}
		incomplete.push(
			...checkExecution(execution, result).findings.map((finding) => `${name}: ${finding}`),
		)
		if (
			name === 'Soxa' &&
			(result.candidate !== 'soxa' ||
				result.sourceHash !== result.harnessSourceHashes?.['tools/bench-ai/Soxa.vue'])
		)
			findings.push('Soxa: baseline source does not match its recorded wrapper')
		if (result.cells?.some((cell) => cell.status === 'not-run'))
			incomplete.push(`${name}: browser observations remain not-run`)
		for (const cell of result.cells ?? []) {
			if (!['passed', 'failed'].includes(cell.status)) continue
			if (!cell.engine || typeof cell.browser !== 'string' || !cell.browser) {
				findings.push(`${name}: missing browser provenance for observed cell`)
				continue
			}
			if (browsers[cell.engine] && browsers[cell.engine] !== cell.browser)
				findings.push(`${name}: ${cell.engine} browser differs from the common cohort`)
			else browsers[cell.engine] = cell.browser
		}
	}
	if (records.length !== expectedCount)
		incomplete.push(`Expected ${expectedCount} subject records, found ${records.length}`)
	return {
		status: findings.length ? 'invalid' : incomplete.length ? 'incomplete' : 'valid',
		reference: reference?.name ?? null,
		expectedCount,
		observedCount: records.length,
		browsers,
		findings: [...new Set(findings)],
		incomplete,
	}
}

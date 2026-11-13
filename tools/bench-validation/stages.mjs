export const defaultStages = ['pages', 'soak', 'control', 'interaction', 'table', 'virtual', 'ssr']

/** Reject empty or unknown stage selections; resumed runs retain every prior stage. */
export function validatedStages(stages) {
	if (
		!Array.isArray(stages) ||
		stages.length === 0 ||
		stages.some((stage) => !defaultStages.includes(stage))
	)
		throw new Error('Expected a nonempty list of known benchmark stages')

	return [...new Set(stages)]
}

export function continuedStages(manifest, stages) {
	return validatedStages([
		...(manifest.stages ?? (manifest.commands?.length ? defaultStages : [])),
		...validatedStages(stages),
	])
}

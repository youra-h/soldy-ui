/** Read a changed property's value while checking its transport envelope. */
export function propertyDetail(event: CustomEvent<unknown>): unknown {
	const detail = event.detail
	const originalPairs = new Set(['value', 'text', 'size', 'variant', 'panelVariant'])
	const operations = new Set(['selection', 'activation'])
	const property = event.type.startsWith('so:change:') ? event.type.slice(10) : undefined

	if (
		property === undefined ||
		originalPairs.has(property) ||
		operations.has(property) ||
		detail === undefined
	) {
		return detail
	}
	if (
		typeof detail !== 'object' ||
		detail === null ||
		!('newValue' in detail) ||
		!('oldValue' in detail)
	) {
		throw new Error(`Missing property change envelope: ${event.type}`)
	}
	return detail.newValue
}

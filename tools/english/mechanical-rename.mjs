// The owner approved the mechanical brand substitution in task 869fpbftq.
// Accept only files with no other changes; newly written comments stay checked.
export function isSoxaRename(before, after) {
	if (!/soldy/i.test(before) || before === after) return false
	const renamed = before.replace(/soldy/gi, (value) =>
		value === value.toUpperCase() ? 'SOXA' : value[0] === 'S' ? 'Soxa' : 'soxa',
	)
	return renamed === after
}

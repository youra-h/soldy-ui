export const items = (count = 100) =>
	Array.from({ length: count }, (_, i) => ({
		value: String(i),
		text: ['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon'][i % 5] + ` ${i + 1}`,
	}))
export const rows = (count) =>
	Array.from({ length: count }, (_, i) => ({
		id: i + 1,
		name: `Record ${String(count - i).padStart(5, '0')}`,
		score: (i * 17) % 101,
	}))

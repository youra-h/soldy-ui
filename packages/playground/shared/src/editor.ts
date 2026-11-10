/** Text alignment commands used by every ToggleGroup preview. */
export const EDITOR_ALIGNMENT_ITEMS = [
	{ text: 'Слева' },
	{ text: 'По центру' },
	{ text: 'Справа' },
	{ text: 'По ширине' },
] as const

/** Small decorative alignment glyphs; the visible label names each action. */
export function editorAlignmentPath(text: string): string {
	const alignment = EDITOR_ALIGNMENT_ITEMS.findIndex((item) => item.text === text)
	const shortStart = alignment === 1 ? 7 : alignment === 2 ? 10 : 4
	const shortWidth = alignment === 3 ? 16 : 10

	return `M4 5h16M${shortStart} 10h${shortWidth}M4 15h16M${shortStart} 20h${shortWidth}`
}

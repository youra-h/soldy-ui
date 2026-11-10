import { describe, it, expect, vi } from 'vitest'
import { TCodeBlock } from '../src'
const snippets = [
	{ value: 'vue', label: 'Vue', code: '<script>\n  hi\n</script>\n' },
	{ value: 'react', label: 'React', code: 'const x = 1' },
	{ value: 'svelte', label: 'Svelte', code: '<h1>Hello</h1>' },
]

describe('CodeBlock model', () => {
	it('keeps the exact source and logical empty lines', () => {
		const block = new TCodeBlock({
			code: 'a\r\n\r\nБ<> 😀\n',
			lineNumbers: true,
			highlightLines: [2],
			maxHeight: 120,
		})
		expect(block.lines.map((line) => line.text).join('')).toBe(block.code)
		expect(block.lines).toHaveLength(4)
		expect(block.lines[1].dataset['data-highlighted']).toBe('true')
		expect(block.contentStyle).toEqual({ 'max-height': '120px' })
	})
	it('uses Tabs activation and preserves tab instances through a patch', () => {
		const block = new TCodeBlock({ snippets, value: 'react' })
		const active = block.engine.extensions.activation.activeItem
		block.snippets = snippets.map((snippet) => ({ ...snippet, label: snippet.label + '!' }))
		expect(block.engine.extensions.activation.activeItem).toBe(active)
		expect(block.value).toBe('react')
		expect(block.source).toBe('const x = 1')

		block.snippets = [snippets[0], snippets[2]]
		expect(block.value).toBe('svelte')
		block.snippets = [snippets[0]]
		expect(block.value).toBe('vue')
		block.snippets = []
		expect(block.value).toBeUndefined()
		expect(block.copyDisabled).toBe(true)
	})
	it('rejects duplicate values before changing the current collection', () => {
		const block = new TCodeBlock({ snippets })
		expect(() => {
			block.snippets = [snippets[0], snippets[0]]
		}).toThrow(/unique/)
		expect(block.snippets).toEqual(snippets)
	})
	it('requests a source snapshot and does not announce success itself', () => {
		const block = new TCodeBlock({ snippets })
		const request = vi.fn()
		const copied = vi.fn()
		block.events.on('copy:request', request)
		block.events.on('copy', copied)
		block.copy()
		expect(request).toHaveBeenCalledWith({ value: 'vue', code: snippets[0].code })
		expect(copied).not.toHaveBeenCalled()
		expect(block.copyState).toBe('idle')
	})
})

it('normalizes known aliases and falls back to text without losing source', () => {
	const block = new TCodeBlock({ code: '<&>', language: 'TS' })
	expect(block.codeDataset['data-language']).toBe('typescript')
	block.language = 'unknown'
	expect(block.codeDataset['data-language']).toBe('text')
	expect(block.source).toBe('<&>')
})

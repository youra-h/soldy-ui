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

describe('CodeBlock syntax', () => {
	it.each([
		'TypeScript',
		' ts ',
		'javascript',
		'tsx',
		'jsx',
		'html',
		'vue',
		'svelte',
		'css',
		'json',
		'bash',
		'python',
		'yaml',
		'unknown',
		'text',
	])('preserves exact token text and line endings for %s', (language) => {
		const crlf = String.fromCharCode(13, 10)
		const lf = String.fromCharCode(10)
		const code = 'const value = "<&> Б 😀";' + crlf + crlf + '/* first' + lf + 'second */' + lf
		const block = new TCodeBlock({ code, language })

		for (const line of block.lines) {
			expect(line.tokens?.map((token) => token.text).join('')).toBe(line.text)
		}
		expect(block.lines.map((line) => line.text).join('')).toBe(code)
	})

	it('highlights multiline syntax and reacts to language and snippet changes', () => {
		const code = ['/* first', 'second */', 'const x: number = 1'].join(String.fromCharCode(10))
		const block = new TCodeBlock({ code, language: 'TypeScript' })

		expect(block.lines[1].tokens?.[0].dataset['data-token']).toBe('comment')
		expect(
			block.lines[2].tokens?.some((token) => token.dataset['data-token'] === 'keyword'),
		).toBe(true)

		block.language = 'text'
		expect(
			block.lines
				.flatMap((line) => line.tokens ?? [])
				.every((token) => token.dataset['data-token'] === ''),
		).toBe(true)

		block.snippets = [
			{
				value: 'html',
				label: 'HTML',
				language: 'html',
				code: '<img src=x onerror="alert(1)">',
			},
		]
		expect(
			block.panels[0].lines[0].tokens?.some((token) => token.dataset['data-token'] === 'tag'),
		).toBe(true)
	})
})

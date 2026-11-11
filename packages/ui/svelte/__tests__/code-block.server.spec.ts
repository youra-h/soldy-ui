import { it, expect } from 'vitest'
import { render } from 'svelte/server'
import { CodeBlock } from '@soxa-ui/svelte'
it('renders safe source and the selected Tabs panel on the server', () => {
	const { body } = render(CodeBlock, {
		props: {
			snippets: [
				{ value: 'first', label: 'First', code: 'one' },
				{ value: 'second', label: 'Second', code: '<img src=x>\n' },
			],
			value: 'second',
		},
	})
	expect(body).toContain('&lt;img src=x')
	expect(body).toContain('role="tabpanel"')
	expect(body).toContain('aria-label="Code"')
	expect(body).not.toContain('<img')
})

it('renders syntax categories on the server', () => {
	const { body } = render(CodeBlock, {
		props: { code: 'const value: string = "<img src=x>";', language: 'TypeScript' },
	})
	expect(body).toContain('data-token="keyword"')
	expect(body).toContain('&lt;img src=x')
	expect(body).not.toContain('<img')
})

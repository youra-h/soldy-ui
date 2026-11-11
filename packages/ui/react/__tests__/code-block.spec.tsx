import { describe, it, expect, vi } from 'vitest'
import { act } from 'react'
import { renderToString } from 'react-dom/server'
import { CodeBlock } from '@soxa-ui/react'
import { TCodeBlock } from '@soxa-ui/core'
import { mount, find } from './mount'
describe('CodeBlock', () => {
	it('updates active text through Tabs and copies the exact original', async () => {
		const code = '  <script>\r\n\r\nlast\n'
		const ctrl = new TCodeBlock({
			snippets: [
				{ value: 'one', label: 'One', code: 'first' },
				{ value: 'two', label: 'Two', code },
			],
		})
		const writeText = vi.fn().mockResolvedValue(undefined)
		const original = Object.getOwnPropertyDescriptor(navigator, 'clipboard')
		Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } })
		try {
			const app = mount(<CodeBlock ctrl={ctrl} />)
			act(() => {
				ctrl.value = 'two'
			})
			expect(find(app.root(), 'code', HTMLElement).textContent).toBe(code)
			await act(async () => {
				find(app.root(), '.so-code-block__copy', HTMLButtonElement).click()
			})
			expect(writeText).toHaveBeenCalledWith(code)
			expect(find(app.root(), '[role=status]', HTMLElement).textContent).toBe('Copied')
			act(() => {
				ctrl.snippets = []
			})
			expect(find(app.root(), '.so-code-block__copy', HTMLButtonElement).disabled).toBe(true)
		} finally {
			if (original) Object.defineProperty(navigator, 'clipboard', original)
			else Reflect.deleteProperty(navigator, 'clipboard')
		}
	})
	it('renders inert source and accessible scroll regions on the server', () => {
		const html = renderToString(<CodeBlock code="<img src=x>" title="main.ts" />)
		expect(html).toContain('&lt;img src=x&gt;')
		expect(html).toContain('aria-label="Code"')
		expect(html).not.toContain('<img')
	})
})

it('renders syntax categories on the server', () => {
	const html = renderToString(
		<CodeBlock code={'const value: string = "<img src=x>";'} language="TypeScript" />,
	)
	expect(html).toContain('data-token="keyword"')
	expect(html).toContain('&lt;img src=x')
	expect(html).not.toContain('<img')
})

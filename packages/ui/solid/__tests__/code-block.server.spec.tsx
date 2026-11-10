import { it, expect } from 'vitest'
import { renderToString } from 'solid-js/web'
import { CodeBlock } from '@soxa-ui/solid'
it('renders safe source and the selected Tabs panel on the server', () => {
	const html = renderToString(() => (
		<CodeBlock
			snippets={[
				{ value: 'first', label: 'First', code: 'one' },
				{ value: 'second', label: 'Second', code: '<img src=x>\n' },
			]}
			value="second"
		/>
	))
	expect(html).toContain('&lt;img src=x')
	expect(html).toContain('role="tabpanel"')
	expect(html).toContain('aria-label="Code"')
	expect(html).not.toContain('<img')
})

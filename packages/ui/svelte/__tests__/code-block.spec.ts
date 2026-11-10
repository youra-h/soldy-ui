import { describe, it, expect } from 'vitest'
import { flushSync } from 'svelte'
import { CodeBlock } from '@soxa-ui/svelte'
import { TCodeBlock } from '@soxa-ui/core'
import { mount, find } from './mount'
describe('CodeBlock', () => {
	it('updates Tabs panels, source and empty state without a local selection', () => {
		const ctrl = new TCodeBlock({
			snippets: [
				{ value: 'one', label: 'One', code: 'first' },
				{ value: 'two', label: 'Two', code: '<script>second</script>\n' },
			],
		})
		const app = mount(CodeBlock, { ctrl })
		expect(find(app.root(), 'code', HTMLElement).textContent).toBe('first')
		ctrl.value = 'two'
		flushSync()
		expect(find(app.root(), 'code', HTMLElement).textContent).toBe('<script>second</script>\n')
		expect(app.root().querySelector('script')).toBeNull()
		ctrl.snippets = []
		flushSync()
		expect(find(app.root(), '.so-code-block__copy', HTMLButtonElement).disabled).toBe(true)
	})
})

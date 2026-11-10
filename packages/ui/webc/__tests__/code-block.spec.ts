import { afterEach, describe, it, expect, vi } from 'vitest'
import { TCodeBlockElement } from '@soxa-ui/webc'
const flush = () => new Promise<void>((resolve) => queueMicrotask(resolve))
afterEach(() => {
	document.body.innerHTML = ''
	vi.restoreAllMocks()
})
describe('CodeBlock', () => {
	it('updates text, active Tabs panels and empty state', async () => {
		const root = document.createElement('div', { is: 'so-code-block' })
		if (!(root instanceof TCodeBlockElement)) throw new Error('CodeBlock is not registered')
		root.snippets = [
			{ value: 'one', label: 'One', code: 'first' },
			{ value: 'two', label: 'Two', code: '<script>second</script>\n' },
		]
		document.body.append(root)
		await flush()
		await flush()
		expect(root.querySelector('code')?.textContent, root.outerHTML).toBe('first')
		root.value = 'two'
		await flush()
		await flush()
		expect(root.querySelector('code')?.textContent).toBe('<script>second</script>\n')
		expect(root.querySelector('script')).toBeNull()
		root.snippets = []
		await flush()
		await flush()
		const copy = root.querySelector('.so-code-block__copy')
		expect(copy instanceof HTMLButtonElement && copy.disabled).toBe(true)
	})
})

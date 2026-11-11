import { afterEach, describe, it, expect, vi } from 'vitest'
import { TCodeBlockElement } from '@soxa-ui/webc'
const flush = () => new Promise<void>((resolve) => queueMicrotask(resolve))
afterEach(() => {
	document.body.innerHTML = ''
	vi.restoreAllMocks()
})
describe('CodeBlock', () => {
	it('lends custom copy content into the same accessible button across modes', async () => {
		const root = document.createElement('div', { is: 'so-code-block' })
		if (!(root instanceof TCodeBlockElement)) throw new Error('CodeBlock is not registered')
		root.code = 'source'
		const content = document.createElement('span')
		content.slot = 'copy'
		content.textContent = 'Copy source'
		root.append(content)
		document.body.append(root)
		for (const update of [
			() => {},
			() => {
				root.title = 'file.ts'
			},
			() => {
				root.snippets = [{ value: 'one', label: 'One', code: 'source' }]
			},
		]) {
			update()
			await flush()
			await flush()
			const button = root.querySelector('.so-code-block__copy')
			expect(button?.contains(content)).toBe(true)
			expect(button?.textContent).toBe('Copy source')
			expect(button?.getAttribute('aria-label')).toBe('Copy')
			expect(button?.querySelector('svg')).toBeNull()
		}
	})
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

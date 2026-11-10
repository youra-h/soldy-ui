import { afterEach, describe, it, expect, vi } from 'vitest'
import { page, userEvent } from 'vitest/browser'
import { loadHost, FRAMEWORKS } from '../src/hosts'
import type { IPreviewHandle } from '@soxa-ui/playground-shared'
import '@soxa-ui/theme-oren'
import { enUS } from '@soxa-ui/plugins'
let handle: IPreviewHandle | undefined
let container: HTMLElement | undefined
let clipboard: PropertyDescriptor | undefined
const frame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
afterEach(() => {
	handle?.unmount()
	handle = undefined
	container?.remove()
	container = undefined
	vi.restoreAllMocks()
	if (clipboard) Object.defineProperty(navigator, 'clipboard', clipboard)
	else Reflect.deleteProperty(navigator, 'clipboard')
	document.documentElement.removeAttribute('data-so-theme')
})
async function show(framework: string, props: Record<string, unknown>) {
	const host = await loadHost(framework)
	host.setLocale(enUS)
	container = document.createElement('div')
	container.style.cssText = 'width:320px;max-width:100%;padding:0'
	document.body.append(container)
	handle = host.mount(container, { component: 'code-block', props })
	await frame()
	await frame()
}
function find(selector: string): HTMLElement {
	const el = container?.querySelector(selector)
	if (!(el instanceof HTMLElement)) throw new Error(selector)
	return el
}
describe.each(FRAMEWORKS)('CodeBlock · $id', ({ id }) => {
	it('keeps long code inside a scroll region and preserves logical line numbers when wrapping', async () => {
		const code = '  <img src=x> ' + 'long'.repeat(70) + '\n\nlast\n'
		await show(id, { code, title: 'main.ts', lineNumbers: true, maxHeight: 90 })
		const pre = find('pre')
		expect(pre.getAttribute('dir')).toBe('ltr')
		expect(pre.scrollWidth).toBeGreaterThan(pre.clientWidth)
		expect(find('.so-code-block').getBoundingClientRect().width).toBeLessThanOrEqual(321)
		expect(
			[...(container?.querySelectorAll('.so-code-block__text') ?? [])]
				.map((el) => el.textContent)
				.join(''),
		).toBe(code)
		expect(container?.querySelectorAll('.so-code-block__gutter')).toHaveLength(4)
		expect(container?.querySelector('img')).toBeNull()
		handle?.update({ code, title: 'main.ts', lineNumbers: true, maxHeight: 90, wrap: true })
		await expect.poll(() => pre.scrollWidth <= pre.clientWidth + 1).toBe(true)
		expect(pre.scrollHeight).toBeGreaterThan(pre.clientHeight)
		expect(container?.querySelectorAll('.so-code-block__copy')).toHaveLength(1)
		const header = find('.so-code-block__header').getBoundingClientRect().top
		pre.scrollTop = pre.scrollHeight
		expect(find('.so-code-block__header').getBoundingClientRect().top).toBe(header)
		pre.focus()
		await expect.element(page.getByRole('region', { name: 'Code', exact: true })).toHaveFocus()
	})
	it('uses Tabs keyboard behavior, copies exact active source and repairs removed tabs', async () => {
		const snippets = [
			{ value: 'vue', label: 'Vue', code: '<script>\n  hello\n</script>\n' },
			{ value: 'react', label: 'React', code: 'const text = "React";\n' },
			{ value: 'svelte', label: 'Svelte', code: '<h1>Svelte</h1>' },
		]
		clipboard = Object.getOwnPropertyDescriptor(navigator, 'clipboard')
		const writeText = vi.fn().mockResolvedValue(undefined)
		Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } })
		await show(id, { snippets })
		await expect
			.element(page.getByRole('tab', { name: 'Vue', exact: true }))
			.toHaveAttribute('aria-selected', 'true')
		find('[role=tab]').focus()
		await userEvent.keyboard('{ArrowRight}')
		await expect
			.element(page.getByRole('tab', { name: 'React', exact: true }))
			.toHaveAttribute('aria-selected', 'true')
		find('.so-code-block__copy').focus()
		await userEvent.keyboard('{Enter}')
		expect(writeText).toHaveBeenCalledWith(snippets[1].code)
		await expect.element(page.getByRole('status')).toHaveTextContent('Copied')
		handle?.update({ snippets: [snippets[0], snippets[2]] })
		await expect
			.element(page.getByRole('tab', { name: 'Svelte', exact: true }))
			.toHaveAttribute('aria-selected', 'true')
		await expect
			.element(page.getByRole('region', { name: 'Code', exact: true }))
			.toHaveTextContent('<h1>Svelte</h1>')
		handle?.update({ snippets: [] })
		await expect
			.element(page.getByRole('button', { name: 'Copy code', exact: true }))
			.toBeDisabled()
	})
	it('removes optional chrome without leaving a blank header or an interactive copy button', async () => {
		await show(id, { code: 'source', copyable: false })
		expect(container?.querySelector('.so-code-block__header')).toBeNull()
		const button = container?.querySelector('.so-code-block__copy')
		expect(button instanceof HTMLElement ? button.getClientRects().length : 0).toBe(0)
		expect(
			find('pre').getBoundingClientRect().top -
				find('.so-code-block').getBoundingClientRect().top,
		).toBe(1)
		handle?.update({ code: 'source', title: 'main.ts', size: '2xl' })
		await expect.poll(() => find('.so-code-block__header').getClientRects().length).toBe(1)
		expect(find('.so-code-block__copy').getBoundingClientRect().bottom).toBeLessThanOrEqual(
			find('.so-code-block__header').getBoundingClientRect().bottom,
		)
	})
	it('renders in the dark scheme without a blank header and reports clipboard denial', async () => {
		document.documentElement.setAttribute('data-so-theme', 'oren-dark')
		clipboard = Object.getOwnPropertyDescriptor(navigator, 'clipboard')
		Object.defineProperty(navigator, 'clipboard', {
			configurable: true,
			value: { writeText: vi.fn().mockRejectedValue(new Error('denied')) },
		})
		await show(id, { code: 'plain text', language: 'unknown-language', direction: 'rtl' })
		expect(container?.querySelector('.so-code-block__header:not([hidden])')).toBeNull()
		expect(find('pre').getAttribute('dir')).toBe('ltr')
		await page.getByRole('button', { name: 'Copy code', exact: true }).click()
		await expect.element(page.getByRole('status')).toHaveTextContent('Unable to copy code')
	})
})

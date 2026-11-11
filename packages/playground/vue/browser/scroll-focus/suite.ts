import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import type { IPreviewHandle, IPreviewHost } from '@soxa-ui/playground-shared'
import { loadHost } from '../../src/hosts'
import '@soxa-ui/theme-oren'

const frame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
const widths = { narrow: '100px', wide: '1400px' }

function html(scope: ParentNode, selector: string): HTMLElement {
	const node = scope.querySelector(selector)

	if (!(node instanceof HTMLElement)) throw new Error(selector + ': missing HTML element')

	return node
}

/** Native focus and scroll behavior through each real adapter, without a shell's tab stops. */
export function scrollFocusSuite(adapter: string): void {
	let host: IPreviewHost
	let handle: IPreviewHandle | undefined
	let scene: HTMLDivElement
	let mount: HTMLDivElement
	let before: HTMLButtonElement
	let after: HTMLButtonElement
	let previousTheme: string | undefined
	let previousFocus: Element | null

	beforeAll(async () => {
		host = await loadHost(adapter)
	})
	beforeEach(() => {
		previousTheme = document.documentElement.dataset.soTheme
		previousFocus = document.activeElement
		document.documentElement.dataset.soTheme = 'oren'
		scene = document.createElement('div')
		scene.style.cssText = 'padding:20px;width:100px'
		before = document.createElement('button')
		after = document.createElement('button')
		before.textContent = 'Before'
		after.textContent = 'After'
		mount = document.createElement('div')
		scene.append(before, mount, after)
		document.body.append(scene)
	})
	afterEach(async () => {
		handle?.unmount()
		handle = undefined
		scene.remove()
		await frame()

		if (previousTheme === undefined) delete document.documentElement.dataset.soTheme
		else document.documentElement.dataset.soTheme = previousTheme

		if (previousFocus instanceof HTMLElement && previousFocus.isConnected) previousFocus.focus()
	})

	for (const component of ['tabs', 'table'] as const) {
		const selector = component === 'tabs' ? '.so-tabs__bar' : '.so-table__viewport'
		const controls = component === 'tabs' ? '[role=tab]' : '.so-table-column__sort'
		const viewport = () => html(scene, selector)
		const following = () => (component === 'tabs' ? html(scene, '[role=tabpanel]') : after)
		const show = async (props: Record<string, unknown> = {}) => {
			handle = host.mount(mount, { component, props: { disabled: true, ...props } })
			await expect.poll(() => viewport().getAttribute('tabindex')).toBe('0')
		}
		const tabInto = async () => {
			before.focus()
			await userEvent.keyboard('{Tab}')
			expect(document.activeElement).toBe(viewport())
			expect(viewport().matches(':focus-visible')).toBe(true)

			const focus = getComputedStyle(viewport())
			expect(focus.outlineStyle).not.toBe('none')
			expect(Number.parseFloat(focus.outlineWidth)).toBeGreaterThan(0)
		}

		describe(adapter + ' ' + component + ' scroll focus', () => {
			for (const direction of ['ltr', 'rtl']) {
				it(
					direction + ': Tab and arrows scroll disabled content; Shift+Tab returns',
					async () => {
						scene.dir = direction
						await show()
						expect(viewport().scrollWidth).toBeGreaterThan(viewport().clientWidth)
						const buttons = [...scene.querySelectorAll(controls)]
						expect(buttons.length).toBeGreaterThan(0)
						expect(buttons.every((node) => node.matches(':disabled'))).toBe(true)
						const presses: Event[] = []
						const onClick = (event: Event) => presses.push(event)
						for (const button of buttons) button.addEventListener('click', onClick)

						await tabInto()

						const start = viewport().scrollLeft
						await userEvent.keyboard(
							direction === 'rtl' ? '{ArrowLeft}' : '{ArrowRight}',
						)
						await expect
							.poll(() => Math.abs(viewport().scrollLeft - start))
							.toBeGreaterThan(0)
						expect(buttons.every((node) => node.matches(':disabled'))).toBe(true)
						await userEvent.keyboard('{Enter} ')
						const first = buttons[0]
						if (!first) throw new Error('Missing disabled control')
						await userEvent.click(first, { force: true })
						expect(presses).toHaveLength(0)
						if (component === 'tabs') {
							const list = html(scene, '.so-tabs__list')
							expect(getComputedStyle(viewport()).pointerEvents).toBe('auto')
							expect(getComputedStyle(list).pointerEvents).toBe('none')
						}
						for (const button of buttons) button.removeEventListener('click', onClick)
						await tabInto()
						await userEvent.keyboard('{Shift>}{Tab}{/Shift}')
						expect(document.activeElement).toBe(before)
						await userEvent.keyboard('{Tab}{Tab}')
						expect(document.activeElement === following()).toBe(true)
					},
				)
			}

			it('resize adds and removes only the necessary stop', async () => {
				await show()
				scene.style.width = widths.wide
				await expect.poll(() => viewport().scrollWidth <= viewport().clientWidth).toBe(true)
				await expect.poll(() => viewport().hasAttribute('tabindex')).toBe(false)
				before.focus()
				await userEvent.keyboard('{Tab}')
				expect(document.activeElement === following()).toBe(true)

				scene.style.width = widths.narrow
				await expect.poll(() => viewport().getAttribute('tabindex')).toBe('0')
				await tabInto()
			})

			it('enabled and disabled transitions preserve existing inner stops', async () => {
				await show()
				handle?.update({ disabled: false })
				await expect.poll(() => viewport().hasAttribute('tabindex')).toBe(false)
				before.focus()
				await userEvent.keyboard('{Tab}')
				expect(viewport().contains(document.activeElement)).toBe(true)
				expect(document.activeElement).not.toBe(viewport())

				handle?.update({ disabled: true })
				await expect.poll(() => viewport().getAttribute('tabindex')).toBe('0')
				await tabInto()
			})

			it('available arbitrary slot content replaces the fallback and tracks hidden/disabled', async () => {
				await show()
				const button = document.createElement('button')
				button.textContent = 'Slot action'
				// Slot DOM is deliberately framework-independent: the plugin must observe
				// content owned by an arbitrary consumer without adapter-specific hooks.
				const target =
					component === 'tabs' ? viewport() : html(scene, '.so-table-row__cell')
				target.append(button)
				await expect.poll(() => viewport().hasAttribute('tabindex')).toBe(false)
				before.focus()
				await userEvent.keyboard('{Tab}')
				expect(document.activeElement).toBe(button)
				await userEvent.keyboard('{Tab}')
				expect(document.activeElement === following()).toBe(true)

				button.hidden = true
				await expect.poll(() => viewport().getAttribute('tabindex')).toBe('0')
				button.hidden = false
				await expect.poll(() => viewport().hasAttribute('tabindex')).toBe(false)
				button.disabled = true
				await expect.poll(() => viewport().getAttribute('tabindex')).toBe('0')
				button.disabled = false
				await expect.poll(() => viewport().hasAttribute('tabindex')).toBe(false)
				button.remove()
				await expect.poll(() => viewport().getAttribute('tabindex')).toBe('0')
			})

			it('content changes remove and restore measured overflow', async () => {
				await show()
				const content =
					component === 'tabs' ? html(scene, '.so-tabs__list') : html(scene, '.so-table')
				// A DOM content replacement is observable even without a framework render.
				const children = [...content.childNodes]
				content.replaceChildren()
				await expect.poll(() => viewport().hasAttribute('tabindex')).toBe(false)
				content.append(...children)
				await expect.poll(() => viewport().getAttribute('tabindex')).toBe('0')
			})
		})
	}

	describe(adapter + ' Table vertical and grid', () => {
		it('native Down scrolls a height-constrained viewport', async () => {
			handle = host.mount(mount, { component: 'table', props: { disabled: true } })
			await expect.poll(() => scene.querySelector('.so-table__viewport')).not.toBeNull()
			const viewport = html(scene, '.so-table__viewport')
			viewport.style.cssText = 'height:60px;overflow:auto'
			await expect.poll(() => viewport.getAttribute('tabindex')).toBe('0')
			expect(viewport.scrollHeight).toBeGreaterThan(viewport.clientHeight)
			before.focus()
			await userEvent.keyboard('{Tab}')
			expect(document.activeElement).toBe(viewport)
			await userEvent.keyboard('{ArrowDown}')
			await expect.poll(() => viewport.scrollTop).toBeGreaterThan(0)
		})

		it('an enabled grid owns its stop; disabled controls stay disabled', async () => {
			handle = host.mount(mount, {
				component: 'table',
				props: { grid: true, disabled: false },
			})
			await expect.poll(() => scene.querySelector('[role=grid]')).not.toBeNull()
			const viewport = html(scene, '.so-table__viewport')
			const grid = html(scene, '[role=grid]')
			await expect.poll(() => grid.getAttribute('tabindex')).toBe('0')
			await frame()
			await frame()
			expect(viewport.hasAttribute('tabindex')).toBe(false)
			before.focus()
			await userEvent.keyboard('{Tab}')
			expect(grid.contains(document.activeElement)).toBe(true)
			expect(document.activeElement === viewport).toBe(false)
			handle.update({ grid: true, disabled: true })
			await expect.poll(() => viewport.getAttribute('tabindex')).toBe('0')
			expect(grid.getAttribute('tabindex')).not.toBe('0')
		})
	})
}

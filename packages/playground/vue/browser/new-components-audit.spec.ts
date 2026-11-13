import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { TAlertDialog } from '@soxa-ui/core'
import { enUS, ruRU } from '@soxa-ui/plugins'
import { FRAMEWORKS, loadHost } from '../src/hosts'
import type { IPreviewHandle, IPreviewHost } from '@soxa-ui/playground-shared'
import '@soxa-ui/theme-oren'

let host: IPreviewHost | undefined
const handles: IPreviewHandle[] = []
const scenes: HTMLElement[] = []
const frame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))

function find(selector: string): HTMLElement {
	const found = document.querySelector(selector)

	if (!(found instanceof HTMLElement)) throw new Error('Missing audit target: ' + selector)

	return found
}

async function mount(component: string, props: Record<string, unknown> = {}) {
	if (!host) throw new Error('Missing audit host')

	const scene = document.createElement('div')

	document.body.append(scene)
	scenes.push(scene)
	const handle = host.mount(scene, { component, props })

	handles.push(handle)
	await frame()
	await frame()

	return handle
}

afterEach(async () => {
	for (const handle of handles.splice(0).reverse()) handle.unmount()
	for (const scene of scenes.splice(0)) scene.remove()

	host?.setLocale(ruRU)
	await expect.poll(() => document.querySelector('.so-alert-dialog,.so-menu__panel')).toBeNull()
})

describe.each(FRAMEWORKS)('new component audit / $id', ({ id }) => {
	it.each(['ltr', 'rtl'])(
		'ToggleButton native keyboard and disabled in %s',
		async (direction) => {
			host = await loadHost(id)
			const handle = await mount('toggle-button', { text: 'Bold', direction })
			const button = find('.so-toggle-button')

			expect(button.getAttribute('type')).toBe('button')
			expect(button.getAttribute('aria-pressed')).toBe('false')
			await userEvent.click(button)
			await expect.poll(() => button.getAttribute('aria-pressed')).toBe('true')
			button.focus()
			await userEvent.keyboard(' ')
			await expect.poll(() => button.getAttribute('aria-pressed')).toBe('false')
			await userEvent.keyboard('{Enter}')
			await expect.poll(() => button.getAttribute('aria-pressed')).toBe('true')
			handle.update({ text: 'Bold', direction, disabled: true })
			await expect.poll(() => button.getAttribute('disabled')).not.toBeNull()
			await userEvent.keyboard('{Enter}')
			expect(button.getAttribute('aria-pressed')).toBe('true')
		},
	)

	for (const orientation of ['horizontal', 'vertical'])
		for (const direction of ['ltr', 'rtl'])
			for (const mode of ['single', 'multiple'])
				it('ToggleGroup ' + [orientation, direction, mode].join('/'), async () => {
					host = await loadHost(id)
					const props = {
						orientation,
						direction,
						mode,
						aria_label: 'Formatting',
						items: [
							{ text: 'Bold' },
							{ text: 'Disabled', disabled: true },
							{ text: 'Italic' },
						],
					}
					const handle = await mount('toggle-group', props)
					const items = [
						...document.querySelectorAll<HTMLElement>('.so-toggle-group-item'),
					]

					expect(items).toHaveLength(3)
					expect(items.filter((item) => item.tabIndex === 0)).toHaveLength(1)
					items[0].focus()
					const arrow =
						orientation === 'vertical'
							? '{ArrowDown}'
							: direction === 'rtl'
								? '{ArrowLeft}'
								: '{ArrowRight}'

					await userEvent.keyboard(arrow)
					expect(document.activeElement).toBe(items[2])
					await userEvent.keyboard(' ')
					await expect.poll(() => items[2].getAttribute('aria-pressed')).toBe('true')
					await userEvent.keyboard('{Home}')
					expect(document.activeElement).toBe(items[0])
					await userEvent.keyboard('{Enter}')
					await expect.poll(() => items[0].getAttribute('aria-pressed')).toBe('true')
					expect(items[2].getAttribute('aria-pressed')).toBe(
						mode === 'multiple' ? 'true' : 'false',
					)
					await userEvent.keyboard('{End}')
					expect(document.activeElement).toBe(items[2])
					handle.update({ ...props, disabled: true })
					await expect
						.poll(() => items.every((item) => item.hasAttribute('disabled')))
						.toBe(true)
				})

	it('AlertDialog safe focus, trap, backdrop, choices, nested layer and locale', async () => {
		host = await loadHost(id)
		host.setLocale(enUS)
		const ctrl = new TAlertDialog()
		let confirms = 0
		let cancels = 0

		ctrl.events.on('confirm', () => confirms++)
		ctrl.events.on('cancel', () => cancels++)
		await mount('alert-dialog', { ctrl })
		const opener = find('.so-button')

		await userEvent.click(opener)
		await expect.poll(() => document.activeElement).toBe(find('.so-alert-dialog__cancel'))
		const panel = find('.so-alert-dialog')

		expect(panel.getAttribute('role')).toBe('alertdialog')
		expect(panel.getAttribute('aria-modal')).toBe('true')
		for (const attribute of ['aria-labelledby', 'aria-describedby']) {
			const referenced = document.getElementById(panel.getAttribute(attribute) ?? '')

			expect(referenced?.textContent?.trim()).toBeTruthy()
		}
		expect(find('.so-alert-dialog__cancel').textContent).toContain('Cancel')
		await userEvent.keyboard('{Shift>}{Tab}{/Shift}')
		expect(panel.contains(document.activeElement)).toBe(true)
		await userEvent.keyboard('{Tab}{Tab}{Tab}{Tab}')
		expect(panel.contains(document.activeElement)).toBe(true)
		await userEvent.click(find('.so-alert-dialog__backdrop'), { position: { x: 5, y: 5 } })
		expect(ctrl.visible).toBe(true)
		find('.so-alert-dialog__cancel').focus()
		await userEvent.keyboard('{Escape}')
		await expect.poll(() => ctrl.visible).toBe(false)
		expect(cancels).toBe(1)
		expect(confirms).toBe(0)
		await expect.poll(() => document.activeElement).toBe(opener)
		await userEvent.click(opener)
		await userEvent.click(find('.so-alert-dialog__action'))
		await expect.poll(() => ctrl.visible).toBe(false)
		expect(confirms).toBe(1)
		await userEvent.click(opener)
		const safe = find('.so-alert-dialog__cancel')

		safe.focus()
		const nested = new TAlertDialog({ visible: true })

		await mount('alert-dialog', { ctrl: nested, visible: true })
		await expect
			.poll(() => document.querySelectorAll('.so-alert-dialog[data-open="true"]').length)
			.toBe(2)
		await userEvent.keyboard('{Escape}')
		await expect.poll(() => nested.visible).toBe(false)
		expect(ctrl.visible).toBe(true)
		await expect.poll(() => document.activeElement).toBe(safe)
		await userEvent.click(safe)
		await expect.poll(() => ctrl.visible).toBe(false)
		expect(cancels).toBe(2)
	})

	it('Breadcrumbs native links, disabled/current, overflow keyboard and update', async () => {
		host = await loadHost(id)
		const props = {
			maxItems: 3,
			items: [
				{ text: 'Home', href: '#home' },
				{ text: 'Catalog', href: '#catalog' },
				{ text: 'Disabled', href: '#disabled', disabled: true },
				{ text: 'Phones', href: '#phones' },
				{ text: 'Current', _: { active: true } },
			],
		}
		const handle = await mount('breadcrumbs', props)

		expect(find('.so-breadcrumbs__link[href="#home"]').tagName).toBe('A')
		expect(find('[aria-current="page"]').textContent).toContain('Current')
		const trigger = find('.so-breadcrumbs__trigger')

		trigger.focus()
		await userEvent.keyboard('{Enter}')
		await expect
			.poll(() => find('.so-breadcrumbs__trigger').getAttribute('aria-expanded'))
			.toBe('true')
		await userEvent.keyboard('{End}')
		expect(document.activeElement?.getAttribute('role')).toBe('menuitem')
		await userEvent.keyboard('{Home}{Escape}')
		await expect
			.poll(() => find('.so-breadcrumbs__trigger').getAttribute('aria-expanded'))
			.toBe('false')
		expect(document.activeElement).toBe(find('.so-breadcrumbs__trigger'))
		handle.update({ ...props, maxItems: 0 })
		await expect.poll(() => document.querySelector('.so-breadcrumbs__trigger')).toBeNull()
		expect(find('.so-breadcrumbs__link[aria-disabled="true"]').hasAttribute('href')).toBe(false)
	})
})

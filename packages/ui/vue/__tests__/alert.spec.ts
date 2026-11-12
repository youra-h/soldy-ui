import { afterEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createSSRApp, h, nextTick } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { Alert, LocaleProvider } from '@soxa-ui/vue'
import { TAlert } from '@soxa-ui/core'
import { enUS, ruRU, extendLocale, type TLocale } from '@soxa-ui/plugins'

afterEach(() => {
	document.body.innerHTML = ''
})

describe('Alert', () => {
	it('updates theme view props and accepts controller changes', async () => {
		const alert = new TAlert()
		const wrapper = mount(Alert, { props: { ctrl: alert, view: 'solid' } })

		expect(wrapper.classes()).toContain('so-alert--view-solid')

		await wrapper.setProps({ view: 'hollow' })

		expect(wrapper.classes()).toContain('so-alert--view-hollow')
		expect(wrapper.classes()).not.toContain('so-alert--view-solid')

		alert.view = undefined
		await nextTick()

		expect(wrapper.classes().some((name) => name.includes('--view-'))).toBe(false)

		wrapper.unmount()
	})

	it('renders slots, lets native role override urgency and leaves focus alone', async () => {
		const focused = document.createElement('button')
		document.body.append(focused)
		focused.focus()

		const wrapper = mount(Alert, {
			attachTo: document.body,
			attrs: { role: 'status' },
			slots: {
				title: 'Saved',
				default: 'Your changes are safe',
				icon: '<svg />',
				action: '<button type="button">Undo</button>',
			},
		})

		expect(wrapper.attributes('role')).toBe('status')
		expect(wrapper.find('button.so-alert__close').exists()).toBe(false)
		expect(wrapper.get('.so-alert__title').text()).toBe('Saved')
		expect(wrapper.get('.so-alert__icon').attributes('aria-hidden')).toBe('true')
		expect(document.activeElement).toBe(focused)

		await wrapper.get('.so-alert__action button').trigger('click')

		expect(wrapper.isVisible()).toBe(true)

		wrapper.unmount()
	})

	it('does not submit a form, cancels hiding and restores the same content', async () => {
		const alert = new TAlert({ closable: true })
		const form = document.createElement('form')
		let submits = 0
		form.addEventListener('submit', (event) => {
			event.preventDefault()
			submits++
		})
		document.body.append(form)

		const wrapper = mount(Alert, {
			attachTo: form,
			props: { ctrl: alert },
			slots: { default: '<input value="retained" />', 'close-icon': '<svg data-custom />' },
		})
		const input = wrapper.get('input').element
		let blocked = true
		alert.events.on('hide:before', (event) => {
			if (blocked) event.preventDefault()
		})

		expect(wrapper.attributes('role')).toBe('alert')
		expect(wrapper.get('.so-alert__close').attributes('type')).toBe('button')

		await wrapper.get('.so-alert__close').trigger('click')

		expect(wrapper.isVisible()).toBe(true)
		expect(submits).toBe(0)

		blocked = false
		await wrapper.get('.so-alert__close').trigger('click')

		expect(wrapper.isVisible()).toBe(false)

		alert.show()
		await nextTick()

		expect(wrapper.isVisible()).toBe(true)
		expect(wrapper.get('input').element).toBe(input)

		wrapper.unmount()
	})

	it('localizes dismissal and accepts complete custom locales without alert translations', async () => {
		const { alert: _alert, ...translations } = enUS.translations
		const oldLocale: TLocale = {
			tag: 'en-US',
			translations: { ...translations, modal: { close: 'Dismiss legacy' } },
		}
		const wrapper = mount(LocaleProvider, {
			props: { locale: ruRU },
			slots: { default: () => h(Alert, { closable: true }) },
		})

		expect(wrapper.get('.so-alert__close').attributes('aria-label')).toBe('Закрыть')

		await wrapper.setProps({ locale: oldLocale })

		expect(wrapper.get('.so-alert__close').attributes('aria-label')).toBe('Dismiss legacy')

		await wrapper.setProps({
			locale: extendLocale(enUS, { translations: { alert: { close: 'Dismiss message' } } }),
		})

		expect(wrapper.get('.so-alert__close').attributes('aria-label')).toBe('Dismiss message')

		wrapper.unmount()
	})

	it('hydrates nonurgent content and the localized dismissal button in place', async () => {
		const tree = () =>
			h(
				Alert,
				{ role: 'status', closable: true },
				{ title: () => 'Notice', default: () => 'Content' },
			)
		const container = document.createElement('div')
		container.innerHTML = await renderToString(tree())
		document.body.append(container)

		const nodes = [...container.querySelectorAll('*')]
		const app = createSSRApp({ render: tree })
		app.mount(container)
		await nextTick()

		expect(
			[...container.querySelectorAll('*')].every((node, index) => node === nodes[index]),
		).toBe(true)
		expect(container.querySelector('.so-alert')?.getAttribute('role')).toBe('status')
		expect(container.querySelector('.so-alert__close')?.getAttribute('aria-label')).toBe(
			'Close',
		)

		app.unmount()
	})
})

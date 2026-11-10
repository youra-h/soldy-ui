import { afterEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createSSRApp, h, nextTick } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { Badge } from '@soxa-ui/vue'

afterEach(() => {
	document.body.innerHTML = ''
})

describe('Badge', () => {
	it('updates formatting without replacing its anchor or hiding its accessible button', async () => {
		let clicks = 0
		const wrapper = mount(Badge, {
			attachTo: document.body,
			props: { value: 120 },
			slots: { anchor: () => h('button', { onClick: () => clicks++ }, 'Inbox') },
		})

		const indicator = () => wrapper.get('.so-badge__indicator')
		const button = wrapper.get('button').element

		expect(indicator().text()).toBe('99+')
		expect(indicator().attributes('role')).toBeUndefined()

		await wrapper.setProps({ aria_label: '120 unread', dot: true })

		expect(indicator().attributes('role')).toBe('img')
		expect(indicator().attributes('aria-label')).toBe('120 unread')
		expect(indicator().text()).toBe('')
		expect(wrapper.attributes('role')).toBeUndefined()
		expect(wrapper.attributes('aria-label')).toBeUndefined()
		expect(wrapper.get('button').element).toBe(button)

		button.click()
		button.focus()

		expect(clicks).toBe(1)
		expect(document.activeElement).toBe(button)

		await wrapper.setProps({ aria_label: undefined })

		expect(indicator().attributes('aria-hidden')).toBe('true')

		await wrapper.setProps({ dot: false, value: 0 })

		expect(indicator().text()).toBe('0')
		expect(indicator().attributes('aria-hidden')).toBeUndefined()

		await wrapper.setProps({ value: '120' })

		expect(indicator().text()).toBe('120')

		await wrapper.setProps({ value: 120, max: 9 })

		expect(indicator().text()).toBe('9+')

		wrapper.unmount()
	})

	it('reacts to labelledBy and removing its name', async () => {
		const wrapper = mount(Badge, { props: { value: 'New', aria_labelledBy: 'name' } })

		expect(wrapper.get('.so-badge__indicator').attributes('aria-labelledby')).toBe('name')
		expect(wrapper.get('.so-badge__indicator').attributes('role')).toBe('img')

		await wrapper.setProps({ aria_labelledBy: undefined })

		expect(wrapper.get('.so-badge__indicator').attributes('role')).toBeUndefined()

		wrapper.unmount()
	})

	it('renders names and capped text on the server without a live region', async () => {
		const html = await renderToString(
			h(
				Badge,
				{ value: 100, aria_label: '100 unread' },
				{ anchor: () => h('button', 'Inbox') },
			),
		)

		expect(html).toContain('99+')
		expect(html).toContain('role="img"')
		expect(html).toContain('aria-label="100 unread"')
		expect(html).not.toMatch(/aria-live|role="status"/)
	})
})

it('hydrates the server indicator and anchor in place', async () => {
	const tree = () =>
		h(Badge, { value: 120, aria_label: '120 unread' }, { anchor: () => h('button', 'Inbox') })
	const container = document.createElement('div')
	container.innerHTML = await renderToString(tree())
	document.body.append(container)
	const nodes = [...container.querySelectorAll('*')]

	const app = createSSRApp({ render: tree })
	app.mount(container)
	await nextTick()

	expect([...container.querySelectorAll('*')].every((node, i) => node === nodes[i])).toBe(true)
	expect(container.querySelector('[role="img"]')?.getAttribute('aria-label')).toBe('120 unread')

	app.unmount()
})

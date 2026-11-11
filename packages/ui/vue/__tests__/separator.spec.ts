import { it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { Separator } from '@soxa-ui/vue'
import { TSeparator } from '@soxa-ui/core'

it('updates semantic state, resets removed props and obeys visibility', async () => {
	const ctrl = new TSeparator()
	const wrapper = mount(Separator, { props: { ctrl, orientation: 'vertical', decorative: true } })

	try {
		expect(wrapper.attributes('role')).toBe('none')
		expect(wrapper.attributes('aria-orientation')).toBeUndefined()
		expect(wrapper.element.children.length).toBe(0)

		await wrapper.setProps({ decorative: false })
		expect(wrapper.attributes('aria-orientation')).toBe('vertical')
		await wrapper.setProps({ orientation: undefined, decorative: undefined })
		expect(wrapper.attributes('aria-orientation')).toBe('horizontal')

		ctrl.decorative = true
		await wrapper.vm.$nextTick()
		expect(wrapper.attributes('role')).toBe('none')
		await wrapper.setProps({ visible: false })
		expect(wrapper.attributes('style')).toContain('display: none')
		await wrapper.setProps({ rendered: false })
		expect(wrapper.find('.so-separator').exists()).toBe(false)
	} finally {
		wrapper.unmount()
	}
})

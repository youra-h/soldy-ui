import { afterEach, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { TFrame } from '@soldy-ui/core'
import { Frame } from '@soldy-ui/vue'

afterEach(() => {
	document.body.innerHTML = ''
})

it('strategy updates the controller, CSS position and public event', async () => {
	const ctrl = new TFrame()
	const changed = vi.fn()
	const wrapper = mount(Frame, {
		props: { ctrl, visible: true, strategy: 'absolute', 'onChange:strategy': changed },
		attachTo: document.body,
	})
	const panel = document.querySelector<HTMLElement>('.so-frame')

	expect(ctrl.strategy).toBe('absolute')
	expect(panel?.style.position).toBe('absolute')
	expect('position' in ctrl).toBe(false)
	changed.mockClear()

	await wrapper.setProps({ strategy: 'fixed' })

	expect(ctrl.strategy).toBe('fixed')
	expect(panel?.style.position).toBe('fixed')
	expect(changed).toHaveBeenCalledExactlyOnceWith({ oldValue: 'absolute', newValue: 'fixed' })

	wrapper.unmount()
})

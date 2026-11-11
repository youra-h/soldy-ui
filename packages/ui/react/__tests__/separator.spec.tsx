import { it, expect } from 'vitest'
import { act } from 'react'
import { TSeparator } from '@soxa-ui/core'
import { Separator } from '@soxa-ui/react'
import { mount } from './mount'

it('updates ctrl semantics without adding focus or content', () => {
	const ctrl = new TSeparator({ orientation: 'vertical', decorative: true })
	const { root } = mount(<Separator ctrl={ctrl} />)

	expect(root().getAttribute('role')).toBe('none')
	expect(root().hasAttribute('aria-orientation')).toBe(false)
	act(() => {
		ctrl.decorative = false
	})
	expect(root().getAttribute('aria-orientation')).toBe('vertical')
	expect(root().tabIndex).toBe(-1)
	expect(root().children.length).toBe(0)
})

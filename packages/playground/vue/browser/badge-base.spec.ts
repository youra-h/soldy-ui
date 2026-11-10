import { it, expect } from 'vitest'
import { defineComponent, h, nextTick } from 'vue'
import { Badge } from '@soxa-ui/vue'
import { render } from './render'
import '@soxa-ui/theme-base'

it('keeps inline labels in flow and overlays a circular dot at logical end', async () => {
	const host = render(
		defineComponent({
			render: () =>
				h('div', { style: 'padding:40px' }, [
					h(Badge, { value: 'Long untruncated label' }),
					h(
						Badge,
						{ dot: true, direction: 'rtl' },
						{ anchor: () => h('button', 'Inbox') },
					),
				]),
		}),
	)
	await nextTick()
	const [inline, overlay] = host.querySelectorAll<HTMLElement>('.so-badge')
	const plain = inline?.querySelector<HTMLElement>('.so-badge__indicator')
	const dot = overlay?.querySelector<HTMLElement>('.so-badge__indicator')
	const button = overlay?.querySelector('button')
	if (!plain || !dot || !button) throw new Error('Missing Badge parts')
	expect(getComputedStyle(plain).position).toBe('static')
	expect(plain.scrollWidth).toBeLessThanOrEqual(plain.clientWidth)
	const rect = dot.getBoundingClientRect(),
		anchor = button.getBoundingClientRect()
	expect(rect.width).toBeCloseTo(rect.height, 1)
	expect(rect.width).toBeGreaterThan(0)
	expect(Math.abs(rect.x + rect.width / 2 - anchor.left)).toBeLessThan(1)
	expect(getComputedStyle(dot).borderRadius).toBe('50%')
})

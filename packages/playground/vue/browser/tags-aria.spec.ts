import { afterEach, describe, expect, it } from 'vitest'
import { page, userEvent } from 'vitest/browser'
import { defineComponent, h, nextTick } from 'vue'
import axe from 'axe-core'
import { Select, Tags } from '@soxa-ui/vue'
import { cleanup, render } from './render'

import '@soxa-ui/theme-oren'

afterEach(cleanup)

const items = [
	{ value: 'a', text: 'Alpha 1' },
	{ value: 'b', text: 'Beta 2' },
]

const harness = (kind: 'Select' | 'Tags', count: number, direction: 'ltr' | 'rtl') =>
	defineComponent({
		render() {
			return h('div', { dir: direction }, [
				kind === 'Select'
					? h(Select, {
							mode: 'multiple',
							editable: true,
							value: items.slice(0, count).map((item) => item.value),
							items,
						})
					: h(Tags, { closable: true, items: items.slice(0, count) }),
			])
		},
	})

const list = () => {
	const node = document.querySelector('.so-tags')
	if (!node) throw new Error('Tag list is missing')
	return node
}
const closes = () => [
	...(document
		.querySelector('.so-tags')
		?.querySelectorAll<HTMLButtonElement>('.so-tags-item__close') ?? []),
]

// The list snapshot proves that each remove button belongs to its item.
describe.each(['ltr', 'rtl'] as const)('%s', (direction) => {
	describe.each(['Select', 'Tags'] as const)('%s', (kind) => {
		it.each([1, 2])('valid list with %i tags', async (count) => {
			render(harness(kind, count, direction))
			await expect.poll(() => closes().length).toBe(count)
			const result = await axe.run(list(), {
				runOnly: {
					type: 'rule',
					values: ['aria-required-children', 'aria-required-parent'],
				},
			})
			expect(result.violations).toEqual([])
			if (count === 1) {
				await expect.element(page.getByRole('list')).toMatchAriaInlineSnapshot(`
- list:
  - listitem:
    - text: Alpha 1
    - button "Close Alpha 1"
`)
			} else {
				await expect.element(page.getByRole('list')).toMatchAriaInlineSnapshot(`
- list:
  - listitem:
    - text: Alpha 1
    - button "Close Alpha 1"
  - listitem:
    - text: Beta 2
    - button "Close Beta 2"
`)
			}
		})
	})

	it.each(['mouse', 'Enter', 'Space'])('Select removal by %s keeps focus', async (gesture) => {
		render(harness('Select', 2, direction))
		await expect.poll(() => closes().length).toBe(2)
		// Focus transfer observes the element after its ready frame.
		await nextTick()
		await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
		const first = closes()[0]
		const second = closes()[1]
		first.focus()
		if (gesture === 'mouse') await userEvent.click(first)
		else await userEvent.keyboard(gesture === 'Enter' ? '{Enter}' : ' ')
		await expect.poll(() => closes().length).toBe(1)
		await expect.poll(() => document.activeElement).toBe(second)
		expect(second.getAttribute('aria-label')).toBe('Close Beta 2')
		if (gesture === 'mouse') await userEvent.click(second)
		else await userEvent.keyboard(gesture === 'Enter' ? '{Enter}' : ' ')
		await expect.poll(() => closes().length).toBe(0)
		await expect
			.poll(() => document.activeElement)
			.toBe(document.querySelector('.so-select input'))
	})
})

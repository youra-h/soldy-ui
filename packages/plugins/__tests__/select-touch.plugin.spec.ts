// @vitest-environment jsdom

import { afterEach, expect, it } from 'vitest'
import { TSelect } from '@soxa-ui/core'
import { TElementPlugin, TPluginBundle, TSelectPointerPlugin } from '../src'

let bundle: TPluginBundle | undefined

afterEach(() => {
	bundle?.destroy()
	document.body.replaceChildren()
})

async function mount() {
	const owner = new TSelect({ editable: true })
	bundle = new TPluginBundle(owner).use(TElementPlugin).use(TSelectPointerPlugin)
	const element = bundle.get(TElementPlugin)
	if (!element) throw new Error('missing element plugin')
	const root = document.createElement('label')
	const field = document.createElement('input')
	const arrow = document.createElement('span')
	arrow.className = 'so-select__arrow'
	root.append(field, arrow)
	document.body.append(root)
	element.element = root
	await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
	return { owner, root, field, arrow }
}

it('preserves the touched arrow when WebKit retargets click to the label input', async () => {
	const { owner, arrow, field } = await mount()
	arrow.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerType: 'touch' }))
	field.dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 1 }))
	expect(owner.open).toBe(true)
	field.dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 1 }))
	expect(owner.open).toBe(true)
})

it('a cancelled touch does not turn the next input click into an arrow click', async () => {
	const { owner, arrow, field } = await mount()
	arrow.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerType: 'touch' }))
	arrow.dispatchEvent(new PointerEvent('pointercancel', { bubbles: true, pointerType: 'touch' }))
	field.dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 1 }))
	expect(owner.open).toBe(false)
})

it('a touch on text keeps editable input closed', async () => {
	const { owner, field } = await mount()
	field.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerType: 'touch' }))
	field.dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 1 }))
	expect(owner.open).toBe(false)
})

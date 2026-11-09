// @vitest-environment jsdom

import { afterEach, describe, expect, it } from 'vitest'
import { TSelect, TSelectCollectionFacade } from '@soxa-ui/core'
import {
	TCollectionBundlesPlugin,
	TElementPlugin,
	TPluginBundle,
	TSelectKeyboardPlugin,
} from '../src'

const bundles: TPluginBundle[] = []

afterEach(() => {
	for (const bundle of bundles.splice(0)) bundle.destroy()
	document.body.innerHTML = ''
})

async function setup(editable: boolean, open: boolean) {
	const owner = new TSelect({ editable })
	const facade = new TSelectCollectionFacade(
		{
			items: [
				{ value: 'a', text: 'Alpha 1' },
				{ value: 'b', text: 'Alpha 2' },
			],
		},
		{ owner },
	)
	const bundle = new TPluginBundle(owner)
		.use(TElementPlugin)
		.use(TCollectionBundlesPlugin)
		.use(TSelectKeyboardPlugin)
	bundles.push(bundle)
	const element = bundle.get(TElementPlugin)
	const registry = bundle.get(TCollectionBundlesPlugin)
	const keyboard = bundle.get(TSelectKeyboardPlugin)
	if (!element || !registry || !keyboard) throw new Error('Select keyboard fixture is incomplete')
	const root = document.createElement('div')
	const input = document.createElement('input')
	root.append(input)
	document.body.append(root)
	registry.bindEngine(facade.engine)
	element.element = root
	await new Promise(requestAnimationFrame)
	owner.open = open
	if (open) keyboard.highlightSelected()
	const press = (key: string, init: KeyboardEventInit = {}) => {
		const event = new KeyboardEvent('keydown', {
			key,
			bubbles: true,
			cancelable: true,
			...init,
		})
		let propagated = false
		const record = () => {
			propagated = true
		}
		document.addEventListener('keydown', record)
		input.dispatchEvent(event)
		document.removeEventListener('keydown', record)
		return { defaultPrevented: event.defaultPrevented, propagated }
	}
	return { owner, keyboard, selection: facade.engine.extensions.selection, press }
}

const keys: [string, KeyboardEventInit][] = [
	['Enter', {}],
	['Escape', {}],
	['ArrowDown', {}],
	['ArrowUp', {}],
	['ArrowDown', { altKey: true }],
	['ArrowUp', { altKey: true }],
	['Home', {}],
	['End', {}],
	['a', {}],
]

describe.each([true, false])('editable=%s', (editable) => {
	describe.each([true, false])('open=%s', (open) => {
		it.each(keys)('composition leaves %s to the IME (%j)', async (key, init) => {
			const { owner, keyboard, selection, press } = await setup(editable, open)
			const highlighted = keyboard.highlightedUid
			const event = press(key, { ...init, isComposing: true })
			expect(owner.open).toBe(open)
			expect(keyboard.highlightedUid).toBe(highlighted)
			expect(selection.selected).toEqual([])
			expect(event.defaultPrevented).toBe(false)
			expect(event.propagated).toBe(true)
		})

		it('code 229 leaves the final composition key to the IME', async () => {
			const { owner, keyboard, selection, press } = await setup(editable, open)
			const highlighted = keyboard.highlightedUid
			const event = press('Enter', { isComposing: false, keyCode: 229 })
			expect(owner.open).toBe(open)
			expect(keyboard.highlightedUid).toBe(highlighted)
			expect(selection.selected).toEqual([])
			expect(event.defaultPrevented).toBe(false)
		})
	})

	it('ordinary keys resume navigation and selection after composition', async () => {
		const { owner, selection, press } = await setup(editable, false)
		press('Enter', { isComposing: true })
		expect(press('ArrowDown').defaultPrevented).toBe(true)
		expect(owner.open).toBe(true)
		press('ArrowDown')
		press('Enter')
		expect(selection.selected.map((item) => item.value)).toEqual(['b'])
		expect(owner.open).toBe(false)
	})
})

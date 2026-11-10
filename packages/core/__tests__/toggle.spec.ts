import { describe, it, expect, vi } from 'vitest'
import {
	TToggleButton,
	TToggleGroup,
	TToggleGroupCollectionFacade,
	createEngine,
	createEngineToggleGroup,
} from '../src'

describe('ToggleButton and ToggleGroup', () => {
	it('keeps pressed ARIA and theme state together and supports cancellation', () => {
		const button = new TToggleButton({ text: 'Bold' })
		const changed = vi.fn()
		button.events.on('change:pressed', changed)

		button.toggle()
		expect(button.pressed).toBe(true)
		expect(button.aria.get('aria-pressed')).toBe('true')
		expect(button.dataset.get('selected')).toBe('true')
		expect(button.text).toBe('Bold')
		expect(button.classes.toString()).toContain('so-button')

		button.events.on('change:pressed:before', (event) => event.preventDefault())
		button.toggle()
		expect(button.pressed).toBe(true)
		expect(changed).toHaveBeenCalledTimes(1)
	})

	it('does not activate disabled buttons but accepts programmatic state', () => {
		const button = new TToggleButton({ disabled: true })
		button.toggle()
		expect(button.pressed).toBe(false)

		button.pressed = true
		expect(button.getProps().pressed).toBe(true)
	})

	it('completes an external engine and uses its selection without copying it', () => {
		const engine = createEngine()
		const owner = new TToggleGroup()
		const facade = new TToggleGroupCollectionFacade(
			{ items: [{ text: 'List' }, { text: 'Grid' }] },
			{ owner, engine },
		)
		const [first, second] = facade.items
		const selection = facade.extensions.selection

		expect(facade.engine).toBe(engine)
		selection.toggle(first)
		selection.toggle(second)
		expect(selection.selected).toEqual([second])
		expect(first.aria.get('aria-pressed')).toBe('false')
		expect(second.aria.get('aria-pressed')).toBe('true')

		selection.toggle(second)
		expect(selection.selected).toEqual([])
	})

	it('chooses the selected entry until actual focus establishes a remembered stop', () => {
		const engine = createEngineToggleGroup({
			items: [{ text: 'List' }, { text: 'Grid', _: { selected: true } }],
		})
		const [first, second] = engine.extensions.batch.shown
		expect(engine.extensions.toggleGroup.tabStop).toBe(second)

		first.focused = true
		first.focused = false
		expect(engine.extensions.toggleGroup.tabStop).toBe(first)
		first.visible = false
		expect(engine.extensions.toggleGroup.tabStop).toBe(second)
	})

	it('honors the selection hook without inventing a second pressed state', () => {
		const engine = createEngineToggleGroup({ items: [{ text: 'Bold' }] })
		const [item] = engine.extensions.batch.shown
		engine.extensions.selection.events.on('item:select:before', (event) =>
			event.preventDefault(),
		)
		engine.extensions.selection.toggle(item)
		expect(item.aria.get('aria-pressed')).toBe('false')
		expect(engine.extensions.selection.selected).toEqual([])
	})

	it('handles multiple selection and removal through the engine', () => {
		const engine = createEngineToggleGroup({ items: [{ text: 'Bold' }, { text: 'Italic' }] })
		const [first, second] = engine.extensions.batch.shown
		const selection = engine.extensions.selection
		selection.mode = 'multiple'
		selection.selectMany([first, second])
		expect(selection.selected).toEqual([first, second])

		engine.extensions.plain.remove(first)
		expect(selection.selected).toEqual([second])
		expect(first.aria.get('aria-pressed')).toBeUndefined()
		expect(engine.extensions.toggleGroup.tabStop).toBe(second)

		second.disabled = true
		expect(engine.extensions.toggleGroup.tabStop).toBeUndefined()
	})
})

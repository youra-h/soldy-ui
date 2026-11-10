import { TButton } from '../button'
import { TChangeEvent } from '../../../common'
import type { TDefaultValues } from '../../base/component'
import type { IToggleButton, IToggleButtonProps, TToggleButtonEvents } from './types'

/** A two-state button. Selection inside a ToggleGroup belongs to its collection instead. */
export class TToggleButton
	extends TButton<IToggleButtonProps, TToggleButtonEvents>
	implements IToggleButton
{
	static defaultValues: typeof TButton.defaultValues &
		TDefaultValues<IToggleButtonProps, 'pressed'> = {
		...TButton.defaultValues,
		pressed: false,
	}

	protected _pressed: boolean

	constructor(props: Partial<IToggleButtonProps> = {}) {
		super(props)
		// Keep Button's size/view/variant modifiers and theme surface.
		this.classes.add('so-toggle-button', false)

		const ctor = new.target as typeof TToggleButton

		this._pressed = props.pressed ?? ctor.defaultValues.pressed
		this._syncPressed()
	}

	get pressed(): boolean {
		return this._pressed
	}

	set pressed(value: boolean) {
		if (value === this._pressed) return

		const event = new TChangeEvent(value, this._pressed)
		this.events.emit('change:pressed:before', event)

		if (event.defaultPrevented || event.value === this._pressed) return

		this._pressed = event.value
		this._syncPressed()
		this.events.emit('change:pressed', { newValue: event.value, oldValue: event.oldValue })
	}

	/** User activation respects disabled; assigning pressed remains programmatic. */
	toggle(): void {
		if (!this.disabled) this.pressed = !this.pressed
	}

	private _syncPressed(): void {
		this.aria.add('aria-pressed', String(this._pressed))
		this.dataset.add('selected', this._pressed)
	}

	override getProps(): IToggleButtonProps {
		return { ...super.getProps(), pressed: this.pressed }
	}
}

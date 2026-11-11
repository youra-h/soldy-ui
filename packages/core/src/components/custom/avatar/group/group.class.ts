import { TComponentView } from '../../../base/component-view'
import type { TDefaultValues } from '../../../base/component'
import type { IAvatarGroup, IAvatarGroupProps, TAvatarGroupEvents } from './types'

export default class TAvatarGroup
	extends TComponentView<IAvatarGroupProps, TAvatarGroupEvents>
	implements IAvatarGroup
{
	static override baseClass = 'so-avatar-group'
	static defaultValues: typeof TComponentView.defaultValues &
		TDefaultValues<IAvatarGroupProps, 'overflow'> = {
		...TComponentView.defaultValues,
		tag: 'span',
		overflow: 0,
	}

	protected _overflow: number

	constructor(props: Partial<IAvatarGroupProps> = {}) {
		super(props)

		this._overflow =
			props.overflow ?? (new.target as typeof TAvatarGroup).defaultValues.overflow
		this._aria.add('role', 'group')
	}

	get overflow(): number {
		return this._overflow
	}

	set overflow(value: number) {
		if (Object.is(value, this._overflow)) return

		const oldValue = this._overflow

		this._overflow = value
		this.events.emit('change:overflow', { newValue: value, oldValue })
	}

	get displayOverflow(): string {
		return Number.isInteger(this._overflow) && this._overflow > 0 ? '+' + this._overflow : ''
	}

	override getProps(): IAvatarGroupProps {
		return { ...super.getProps(), overflow: this._overflow }
	}
}

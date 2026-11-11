import { TStylable } from '../../base/stylable'
import type { TDefaultValues } from '../../base/component'
import type { IAvatar, IAvatarProps, TAvatarEvents, TAvatarShape, TAvatarStatus } from './types'

export default class TAvatar extends TStylable<IAvatarProps, TAvatarEvents> implements IAvatar {
	static override baseClass = 'so-avatar'
	static defaultValues: typeof TStylable.defaultValues &
		TDefaultValues<IAvatarProps, 'src' | 'initials', 'shape'> = {
		...TStylable.defaultValues,
		tag: 'span',
		src: '',
		initials: '',
		shape: undefined,
	}

	protected _src: string
	protected _initials: string
	protected _shape: TAvatarShape | undefined
	protected _status: TAvatarStatus = 'idle'

	constructor(props: Partial<IAvatarProps> = {}) {
		super(props)

		const defaults = (new.target as typeof TAvatar).defaultValues

		this._src = props.src ?? defaults.src
		this._initials = props.initials ?? defaults.initials
		this._shape = props.shape ?? defaults.shape

		this._classes.swap({ prefix: '--shape-', newValue: this._shape })
		this._dataset.add('status', this._status)
	}

	get src(): string {
		return this._src
	}

	set src(value: string) {
		if (value === this._src) return

		const oldValue = this._src

		this._src = value
		// Invalidate the old image synchronously, even without a mounted DOM plugin.
		this.status = 'idle'
		this.events.emit('change:src', { newValue: value, oldValue })
	}

	get initials(): string {
		return this._initials
	}

	set initials(value: string) {
		if (value === this._initials) return

		const oldValue = this._initials

		this._initials = value
		this.events.emit('change:initials', { newValue: value, oldValue })
	}

	get shape(): TAvatarShape | undefined {
		return this._shape
	}

	set shape(value: TAvatarShape | undefined) {
		if (value === this._shape) return

		const oldValue = this._shape

		this._shape = value
		this._classes.swap({ prefix: '--shape-', oldValue, newValue: value })
		this.events.emit('change:shape', { newValue: value, oldValue })
	}

	get status(): TAvatarStatus {
		return this._status
	}

	set status(value: TAvatarStatus) {
		if (value === this._status) return

		const oldValue = this._status

		this._status = value
		this._dataset.add('status', value)
		this.events.emit('change:status', { newValue: value, oldValue })
	}

	override getProps(): IAvatarProps {
		return { ...super.getProps(), src: this._src, initials: this._initials, shape: this._shape }
	}
}

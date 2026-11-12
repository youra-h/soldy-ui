import { TAria, TChangeEvent } from '../../../common'
import { TStylable } from '../../base/stylable'
import type { TDefaultValues } from '../../base/component'
import type { IAlert, IAlertProps, TAlertEvents, TAlertView } from './types'

/** Inline urgent message. Applications use the native role="status" for nonurgent content. */
export default class TAlert extends TStylable<IAlertProps, TAlertEvents> implements IAlert {
	static override baseClass = 'so-alert'

	static defaultValues: typeof TStylable.defaultValues &
		TDefaultValues<IAlertProps, 'closable', 'view'> = {
		...TStylable.defaultValues,
		tag: 'div',
		closable: false,
		view: undefined,
	}

	protected _view: TAlertView | undefined
	protected _closable: boolean
	protected _closeAria: TAria

	constructor(props: Partial<IAlertProps> = {}) {
		super(props)

		const defaults = (new.target as typeof TAlert).defaultValues

		this._view = props.view ?? defaults.view
		this._classes.swap({ prefix: '--view-', newValue: this._view })

		this._closable = props.closable ?? defaults.closable
		this._aria.add('role', 'alert')
		this._dataset.add('closable', this._closable)

		this._closeAria = new TAria()
		this._closeAria.subscribe((_set, oldValue) =>
			this.events.emit('change:closeAria', {
				newValue: this._closeAria.toObject(),
				oldValue,
			}),
		)
	}

	get view(): TAlertView | undefined {
		return this._view
	}

	set view(value: TAlertView | undefined) {
		if (value === this._view) return

		const oldValue = this._view

		this._classes.swap({ prefix: '--view-', oldValue, newValue: value })
		this._view = value
		this.events.emit('change:view', { newValue: value, oldValue })
	}

	get closable(): boolean {
		return this._closable
	}

	set closable(value: boolean) {
		if (value === this._closable) return

		const event = new TChangeEvent(value, this._closable)
		this.events.emit('change:closable:before', event)

		if (event.defaultPrevented || event.value === this._closable) return

		this._closable = event.value
		this._dataset.add('closable', event.value)
		this.events.emit('change:closable', { newValue: event.value, oldValue: event.oldValue })
	}

	get closeAria(): TAria {
		return this._closeAria
	}

	override getProps(): IAlertProps {
		return { ...super.getProps(), closable: this._closable, view: this._view }
	}
}

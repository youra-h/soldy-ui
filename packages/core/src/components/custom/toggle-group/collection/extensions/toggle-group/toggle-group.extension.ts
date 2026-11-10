import type { TValuePayload } from '../../../../../../common'
import type {
	IBaseOwnerItemExtensionOptions,
	IExtension,
	IExtensionContext,
	ISelectionExtension,
} from '../../../../../base/collection'
import type { TToggleGroupView } from '../../../types'
import { TBaseOwnerItemExtension, selectionOf } from '../../../../../base/collection'
import type { IToggleGroupItem } from '../../../item/types'
import type { IToggleGroup } from '../../../types'
import type {
	TToggleGroupExtensionEvents,
	TToggleGroupEngineOptions,
	IToggleGroupExtension,
} from './types'
import { TToggleGroupItemExtension, type IToggleGroupItemExtension } from './item'

/** Owns group semantics and style inheritance; selection stays in the shared extension. */
export class TToggleGroupExtension<
	TOwner extends IToggleGroup = IToggleGroup,
	TItem extends IToggleGroupItem = IToggleGroupItem,
>
	extends TBaseOwnerItemExtension<
		TItem,
		IToggleGroupItemExtension<TItem>,
		TToggleGroupExtensionEvents,
		TToggleGroupEngineOptions<TOwner>
	>
	implements IExtension<TItem>, IToggleGroupExtension<TItem>
{
	readonly name = 'toggleGroup' as const
	private _stop: TItem | undefined

	constructor(options?: IBaseOwnerItemExtensionOptions<TItem, IToggleGroupItemExtension<TItem>>) {
		super(TToggleGroupItemExtension, options)
	}

	get view(): TToggleGroupView | undefined {
		return this._ctx.options.get('owner')?.view
	}

	override install(ctx: IExtensionContext<TItem, TToggleGroupEngineOptions<TOwner>>): void {
		super.install(ctx)

		ctx.driver.events.on('item:added', (e) => this._inheritOwner(e.item as TItem))
		ctx.driver.events.on('item:updated', (e) => this._inheritOwner(e.item as TItem))

		// The selection extension writes data-selected; this pattern adds aria-pressed.
		const selection = selectionOf(ctx)

		if (selection) {
			selection.events.on('change:selection', () => this._syncPressed(selection))
			ctx.driver.events.on('item:added', (e) =>
				this._applyPressed(e.item as TItem, selection),
			)

			this._syncPressed(selection)
		}

		ctx.driver.valueOf().forEach((item) => this._watch(item))
		ctx.driver.events.on('item:added', ({ item }) => this._watch(item as TItem))
		ctx.driver.events.on('item:removed', ({ item }) => this._unwatch(item as TItem))
		ctx.driver.events.on('change:items', this._syncTabStop)
		selection?.events.on('change:selection', this._syncTabStop)
		this._syncTabStop()

		let view = this.view

		// The observer scope releases the previous owner's listeners on replacement.
		ctx.options.watch('owner', (owner, scope) => {
			if (view !== this.view) {
				const oldValue = view
				view = this.view
				this.events.emit('change:view', { newValue: view, oldValue })
			}

			if (!owner) return

			ctx.driver.valueOf().forEach((item) => this._inheritOwner(item))

			scope.on(
				owner.events,
				'change:disabled',
				({ newValue: value }: TValuePayload<boolean>) => {
					ctx.driver.valueOf().forEach((item) => {
						item.disabled = value
					})
				},
			)
			scope.on(owner.events, 'change:size', () =>
				ctx.driver.valueOf().forEach((item) => this._applyStyle(item, owner)),
			)
			scope.on(owner.events, 'change:variant', () =>
				ctx.driver.valueOf().forEach((item) => this._applyStyle(item, owner)),
			)

			scope.on(
				owner.events,
				'change:view',
				({ newValue: value }: TValuePayload<TToggleGroupView | undefined>) => {
					const oldValue = view
					view = value
					ctx.driver.valueOf().forEach((item) => this._applyStyle(item, owner))
					this.events.emit('change:view', { newValue: value, oldValue })
				},
			)
		})
	}

	/** The remembered focus stop is independent of the collection's selection. */
	get tabStop(): TItem | undefined {
		const items = this._ctx.driver.valueOf().filter((item) => this.isEnabled(item))

		return (
			items.find((item) => item.focused) ??
			(this._stop && items.includes(this._stop) ? this._stop : undefined) ??
			items.find((item) => selectionOf(this._ctx)?.isSelected(item)) ??
			items[0]
		)
	}

	isEnabled(item: TItem): boolean {
		return !item.disabled && item.visible && item.rendered
	}

	/** Model attributes provide one Tab stop even before the DOM plugins mount. */
	private readonly _syncTabStop = (): void => {
		const stop = this.tabStop
		if (stop?.focused) this._stop = stop

		this._ctx.driver
			.valueOf()
			.forEach((item) => item.aria.add('tabindex', item === stop ? '0' : '-1'))
	}

	private _watch(item: TItem): void {
		item.events.on('change:tag', this._syncTabStop)
		item.events.on('change:focused', this._syncTabStop)
		item.events.on('change:disabled', this._syncTabStop)
		item.events.on('change:visible', this._syncTabStop)
		item.events.on('change:rendered', this._syncTabStop)
	}

	private _unwatch(item: TItem): void {
		item.events.off('change:tag', this._syncTabStop)
		item.events.off('change:focused', this._syncTabStop)
		item.events.off('change:disabled', this._syncTabStop)
		item.events.off('change:visible', this._syncTabStop)
		item.events.off('change:rendered', this._syncTabStop)
		item.aria.remove('aria-pressed')
		item.aria.remove('tabindex')
	}

	private _inheritOwner(item: TItem): void {
		const owner = this._ctx.options.get('owner')

		if (!owner) return

		this._applyStyle(item, owner)

		if (owner.disabled) item.disabled = true
	}

	private _applyStyle(item: TItem, owner: TOwner): void {
		item.size = owner.size
		item.variant = owner.variant
		item.view = owner.view
	}

	private _syncPressed(selection: ISelectionExtension<TItem>): void {
		this._ctx.driver.valueOf().forEach((item) => this._applyPressed(item, selection))
	}

	private _applyPressed(item: TItem, selection: ISelectionExtension<TItem>): void {
		item.aria.add('aria-pressed', selection.isSelected(item) ? 'true' : 'false')
	}
}

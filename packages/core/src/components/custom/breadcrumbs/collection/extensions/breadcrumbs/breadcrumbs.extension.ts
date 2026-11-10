import { TBaseOwnerItemExtension, activationOf, batchOf } from '../../../../../base/collection'
import type {
	IExtensionContext,
	IBaseOwnerItemExtensionOptions,
} from '../../../../../base/collection'
import type { IBreadcrumbs } from '../../../types'
import type { IBreadcrumbsItem } from '../../../item/types'
import { TMenu, TMenuItem } from '../../../../menu'
import type { TBreadcrumbsEngineOptions } from '../../types'
import type {
	IBreadcrumbsExtension,
	TBreadcrumbsExtensionEvents,
	TBreadcrumbsOverflowEntry,
} from './types'
import { TBreadcrumbsItemExtension, type IBreadcrumbsItemExtension } from './item'

/** The collapsed window never changes membership or activation. */

export class TBreadcrumbsExtension<
	TOwner extends IBreadcrumbs = IBreadcrumbs,
	TItem extends IBreadcrumbsItem = IBreadcrumbsItem,
>
	extends TBaseOwnerItemExtension<
		TItem,
		IBreadcrumbsItemExtension<TItem>,
		TBreadcrumbsExtensionEvents,
		TBreadcrumbsEngineOptions<TOwner>
	>
	implements IBreadcrumbsExtension<TItem>
{
	readonly name = 'breadcrumbs' as const
	readonly menu = new TMenu()
	private _overflowEntries: readonly TBreadcrumbsOverflowEntry<TItem>[] = []

	private readonly _proxies = new Map<TItem, TMenuItem>()
	private _firstItem: TItem | undefined

	private readonly _present = () => this._syncWindow()

	private readonly _renamed = () => {
		this._syncProxies()
		this.events.emit('change:window')
	}

	constructor(options?: IBaseOwnerItemExtensionOptions<TItem, IBreadcrumbsItemExtension<TItem>>) {
		super(TBreadcrumbsItemExtension, options)
	}

	get overflowEntries() {
		return this._overflowEntries
	}

	get overflowAria() {
		return this._ctx.options.get('owner')?.overflowAria
	}

	get firstItem() {
		return this._firstItem
	}
	isCollapsed(item: TItem): boolean {
		return this._proxies.has(item)
	}

	override install(ctx: IExtensionContext<TItem, TBreadcrumbsEngineOptions<TOwner>>): void {
		super.install(ctx)

		const added = (item: TItem) => {
			this._inheritOwner(item)
			this._applyCurrent(item)
			item.events.on('change:present', this._present)
		}

		ctx.driver.valueOf().forEach(added)
		ctx.driver.events.on('item:added', (event) => added(event.item as TItem))
		ctx.driver.events.on('item:updated', (event) => this._inheritOwner(event.item as TItem))
		ctx.driver.events.on('item:removed', (event) =>
			(event.item as TItem).events.off('change:present', this._present),
		)
		batchOf(ctx)?.events.on('change:shown', () => this._syncWindow())

		activationOf(ctx)?.events.on('change:activation', () => {
			ctx.driver.valueOf().forEach((item) => this._applyCurrent(item))
			this._syncProxies()
		})

		ctx.options.watch('owner', (owner, scope) => {
			this.menu.open = false

			if (owner) {
				ctx.driver.valueOf().forEach((item) => this._inheritOwner(item))
				this.menu.size = owner.size
				this.menu.variant = owner.variant

				scope.on(owner.events, 'change:size', () => {
					this.menu.size = owner.size
					ctx.driver.valueOf().forEach((item) => this._inheritOwner(item))
				})
				scope.on(owner.events, 'change:variant', () => {
					this.menu.variant = owner.variant
					ctx.driver.valueOf().forEach((item) => this._inheritOwner(item))
				})
				scope.on(owner.events, 'change:maxItems', () => this._syncWindow())
				scope.on(owner.events, 'change:overflowAria', () =>
					this.events.emit('change:overflowAria'),
				)
			}

			this._syncWindow()
			this.events.emit('change:overflowAria')
		})

		this._syncWindow()
	}

	private _inheritOwner(item: TItem): void {
		const owner = this._ctx.options.get('owner')
		if (!owner) return

		item.size = owner.size
		item.variant = owner.variant
	}

	private _applyCurrent(item: TItem): void {
		if (activationOf(this._ctx)?.isActive(item)) item.aria.add('aria-current', 'page')
		else item.aria.remove('aria-current')
	}

	private _syncWindow(): void {
		const items = (batchOf(this._ctx)?.shown ?? []).filter((item) => item.present)
		this._firstItem = items[0]

		const limit = this._ctx.options.get('owner')?.maxItems ?? 5
		const hidden =
			limit > 0 && items.length > limit ? items.slice(1, items.length - limit + 2) : []
		const changed =
			hidden.length !== this._overflowEntries.length ||
			hidden.some((item, index) => this._overflowEntries[index]?.item !== item)
		if (!changed) {
			this.events.emit('change:window')
			return
		}

		this.menu.open = false
		const current = new Set(hidden)

		for (const item of this._proxies.keys()) {
			if (current.has(item)) continue

			item.events.off('change:text', this._renamed)
			item.events.off('change:attrs', this._renamed)
			item.events.off('change:disabled', this._renamed)
			this._proxies.delete(item)
		}

		this._overflowEntries = hidden.map((item) => {
			let menuItem = this._proxies.get(item)

			if (!menuItem) {
				menuItem = new TMenuItem({ value: item.uid })
				this._proxies.set(item, menuItem)
				item.events.on('change:text', this._renamed)
				item.events.on('change:attrs', this._renamed)
				item.events.on('change:disabled', this._renamed)
			}
			return { item, menuItem }
		})

		this._syncProxies()
		this.events.emit('change:window')
	}

	private _syncProxies(): void {
		for (const { item, menuItem } of this._overflowEntries) {
			menuItem.text = item.text
			menuItem.disabled = item.disabled || item.href === undefined

			if (activationOf(this._ctx)?.isActive(item)) menuItem.aria.add('aria-current', 'page')
			else menuItem.aria.remove('aria-current')
		}
	}
}

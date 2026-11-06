import type { ICommand, ICommandContext } from './types'
import type { TValuePayload } from '../../../../../common'
import { TRemoveEvent } from '../types'

/**
 * Команда удаления элемента из коллекции.
 *
 * Идемпотентна целиком, а не только по данным: `storage.remove` и раньше
 * молча пропускал отсутствующий элемент, но уведомление уходило всё равно —
 * и подписчики (`selection`, реестр контекстов, bundles) реагировали на
 * удаление, которого не было. Теперь `item:removed` шлётся, только если
 * элемент действительно лежал в хранилище.
 *
 * Это не теоретический случай: закрытие таба удаляет его из коллекции, следом
 * UI размонтирует компонент — и удаление приходило вторым заходом.
 *
 * До мутации шлётся `item:remove:before` — по той же модели, что у вставки и
 * обновления: подписчик может отменить удаление через `preventDefault()`.
 * Хук шлётся только если элемент реально лежит в хранилище — иначе сломалась
 * бы идемпотентность выше.
 */
export class TRemoveCommand<TItem> implements ICommand<TItem> {
	private _event?: TRemoveEvent<TItem>
	private _removed = false
	private _count?: TValuePayload<number>

	constructor(public item: TItem) {}

	get changed(): boolean {
		return this._removed
	}

	apply(ctx: ICommandContext<TItem>): void {
		if (!ctx.storage.items.includes(this.item)) return

		const event = new TRemoveEvent<TItem>(this.item)
		this._event = event

		ctx.events.emit('item:remove:before', event)

		if (event.defaultPrevented) return

		this._removed = true

		const oldValue = ctx.storage.items.length
		ctx.storage.remove(this.item)
		this._count = { newValue: ctx.storage.items.length, oldValue }
	}

	emitEvents(ctx: ICommandContext<TItem>): void {
		if (!this._removed) return

		ctx.events.emit('item:removed', this._event as TRemoveEvent<TItem>)
		if (this._count) ctx.events.emit('change:count', this._count)
	}
}

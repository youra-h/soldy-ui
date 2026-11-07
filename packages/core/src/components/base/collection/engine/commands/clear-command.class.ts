import type { ICommand, ICommandContext } from './types'
import type { TValuePayload } from '../../../../../common'
import { TClearEvent, TRemoveEvent } from '../types'

/**
 * Команда очистки коллекции. Удаляет все элементы из хранилища и сохраняет их
 * снимок для последующего уведомления о событиях.
 *
 * До мутации шлётся один `items:clear:before` на всю операцию, а не по хуку
 * на элемент: отменить удаление части элементов оставило бы коллекцию
 * непустой, а `reset` по смыслу значит «коллекция пуста». После отмены
 * хранилище не трогаем и никаких событий не шлём.
 */
export class TClearCommand<TItem> implements ICommand<TItem> {
	/** Снимок удалённых элементов. Есть только после состоявшейся очистки. */
	private _cleared: TClearEvent<TItem> | null = null
	private _count?: TValuePayload<number>

	get changed(): boolean {
		return this._cleared !== null
	}

	apply(ctx: ICommandContext<TItem>): void {
		const items = ctx.storage.items

		if (items.length === 0) return

		const event = new TClearEvent<TItem>([...items])

		ctx.events.emit('items:clear:before', event)

		if (event.defaultPrevented) return

		this._cleared = event

		const oldValue = ctx.storage.items.length
		ctx.storage.clear()
		this._count = { newValue: ctx.storage.items.length, oldValue }
	}

	emitEvents(ctx: ICommandContext<TItem>): void {
		const cleared = this._cleared

		if (!cleared) return

		cleared.items.forEach((item) =>
			ctx.events.emit('item:removed', new TRemoveEvent<TItem>(item)),
		)

		if (this._count) ctx.events.emit('change:count', this._count)
		ctx.events.emit('reset')
	}
}

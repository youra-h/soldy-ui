import { plainOf, selectOf, selectionOf, tagsOf } from '@soxa-ui/core'
import { TAriaPlugin } from '../../component-view'
import { TCollectionBundlesPlugin } from '../../collection'
import type { ISelect } from '@soxa-ui/core'
import { TBasePlugin } from '../../../base'
import type { IPluginContext } from '../../../base'

/**
 * TSelectIdsPlugin — связка «поле ↔ список» Select в документе.
 *
 * `id` списка — в `listAria`, который разметка раскладывает на список, и
 * ссылка на него `aria-controls` — в `aria` поля (`field.aria`): связку со
 * списком объявляет поле с `role="combobox"`, а не корень Select. Список
 * существует всегда — в отличие от панели у Tabs, которой может и не быть, —
 * поэтому ссылка стоит всегда.
 *
 * Сторона опций — у самих опций (`TOptionIdsPlugin`, общий с элементами
 * ListBox): у каждой своё монтирование. `aria-activedescendant` берёт `id`
 * подсвеченной опции из её набора (`TSelectKeyboardPlugin`).
 *
 * `id` — от монтирования (`createId`), а не от экземпляра: он нужен только
 * документу, и на сервере и в браузере обязан совпасть. Пишется при
 * установке, синхронно, — связка есть уже в первой (и серверной) отрисовке.
 */
export class TSelectIdsPlugin extends TBasePlugin {
	override install(ctx: IPluginContext): void {
		super.install(ctx)

		const select = ctx.getInstance<ISelect>()

		if (!select) return

		const listId = ctx.createId('list')

		select.listAria.add('id', listId)
		select.field.aria.add('aria-controls', listId)
		// A multiple combobox has an empty text input; its selected tags supply
		// the description without replacing form hints or the consumer's name.
		const tagsId = ctx.createId('selected')
		const aria = ctx.get(TAriaPlugin)
		ctx.get(TCollectionBundlesPlugin)?.events.on('engine:bound', (engine) => {
			const tags = tagsOf(engine)
			const selection = selectionOf(engine)
			const selected = selectOf(engine)
			const sync = (): void => {
				const list = tags?.tags
				list?.aria.add('id', tagsId)
				list?.aria.add('aria-label', selected?.text || null)
				if (aria) aria.parts = tags?.hasTags ? { describedBy: tagsId } : {}
			}
			const bindTags = (): void => {
				sync()
				const plain = plainOf(tags?.engine)
				this._listenTo(plain?.events, 'item:updated', sync)
				this._listenTo(plain?.events, 'change:items', sync)
			}
			bindTags()
			this._listenTo(tags?.events, 'change:tags', bindTags)
			this._listenTo(selection?.events, 'change:selection', sync)
		})
	}
}

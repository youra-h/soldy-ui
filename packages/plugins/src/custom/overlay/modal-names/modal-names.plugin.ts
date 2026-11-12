import type { TPluginEvents } from '../../../base'
import type { IModalLayer } from '@soxa-ui/core'
import { TNamesPlugin } from '../../../locale/names.plugin'
import type { TTranslations } from '../../../locale/types'

/**
 * TModalNamesPlugin — имя кнопки закрытия модального слоя от локали: в
 * `closeAria`.
 *
 * Ставится наследникам слоя — выезжающей панели и, через
 * `TDialogNamesPlugin`, окну, — как плагины связок: у каждого свой.
 * Дженерик по владельцу — для наследника, у которого кнопок больше.
 */
export class TModalNamesPlugin<
	TOwner extends IModalLayer<any, any> = IModalLayer,
	TEvents extends TPluginEvents = TPluginEvents,
> extends TNamesPlugin<TOwner, TEvents> {
	protected override _name(owner: TOwner, translations: TTranslations): void {
		owner.closeAria.add('aria-label', translations.modal.close)
	}
}

/** Шаблон разделителя меню: внутри ничего, слотов нет, содержимое не выводится. */

import type { TMenuSeparator } from '@soxa-ui/core'
import type { ITemplate } from '../../../adapter'

export const menuSeparatorTemplate: ITemplate<TMenuSeparator> = {
	create: () => ({ slots: {} }),

	bindings: [],
}

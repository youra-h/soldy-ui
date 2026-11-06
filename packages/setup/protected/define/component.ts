/**
 * defineComponent infers a component contract from its class and declarations.
 * Public events come only from explicit `events`, including inherited declarations.
 */

import { TComponentDescriptor } from './component-descriptor.class'
import type { TCheckedEventNames, TContractFrom } from './inference.types'
import type { IComponentDescriptor, IComponentOptions } from './types'

/**
 * Параметр типа один — сами опции, и явно его не передают. `const`: опции
 * запоминаются литералом, иначе имена событий, триггеров и слотов вывелись бы
 * `string`, а неймспейсы плагинов пропали бы из типов адаптеров.
 *
 * Имена событий сверяются с картой событий инстанса (`TCheckedEventNames`).
 */
export function defineComponent<const TOptions extends IComponentOptions>(
	options: TOptions & TCheckedEventNames<TOptions>,
): IComponentDescriptor<TContractFrom<TOptions>>

/** Тело — под сигнатурой без контракта: рантайму он не нужен (см. `TComponentDescriptor`). */
export function defineComponent(options: IComponentOptions): IComponentDescriptor {
	return new TComponentDescriptor(options)
}

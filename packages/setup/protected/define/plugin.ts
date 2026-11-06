/**
 * definePlugin infers and registers a plugin contract from its class and contribution.
 * Public events come only from explicit `events`; property triggers refresh state and models.
 */

import type { IContribution } from './contribution.types'
import type { TPluginContractFrom } from './inference.types'
import type { IPluginDefinition, TPluginCtor } from './types'
import { normalizeContribution } from './contribution'
import { TPluginDefinition } from './plugin-definition.class'

const contracts = new WeakMap<TPluginCtor, IPluginDefinition>()

/**
 * Параметры типа выводятся из опций, явно их не передают. Неймспейс и
 * contribution — `const`: из их литералов складываются имена в контракте.
 */
export function definePlugin<
	TCtor extends TPluginCtor,
	const N extends string | undefined = undefined,
	const TContribution extends IContribution = IContribution,
>(options: {
	ctor: TCtor
	namespace?: N
	contribution?: TContribution
}): IPluginDefinition<TPluginContractFrom<InstanceType<TCtor>, N, TContribution>> {
	const { props, events } = normalizeContribution(options.contribution, options.namespace)

	const definition = new TPluginDefinition<
		TPluginContractFrom<InstanceType<TCtor>, N, TContribution>
	>(options.ctor, options.namespace, props, events)

	contracts.set(options.ctor, definition)

	return definition
}

/** Контракт плагина — его объявление `definePlugin`; нет — пропсов и событий у плагина нет. */
export function pluginContractOf(ctor: TPluginCtor): IPluginDefinition | undefined {
	return contracts.get(ctor)
}

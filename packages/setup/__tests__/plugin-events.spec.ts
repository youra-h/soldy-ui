/** Runtime declarations and inferred types expose domain events, not plugin lifecycle events. */

import { describe, it, expect } from 'vitest'
import { exportedDescriptors, CallbackProfile } from './helpers'
import { TSurface, ControlDescriptor, SelectDescriptor } from '@soldy-ui/setup'
import type { DescriptorAllEvents, IComponentDescriptor } from '@soldy-ui/setup'

/**
 * Имена событий в типах дескриптора: свои и плагинные. Из этой же карты React,
 * Solid и Svelte выводят колбэк-пропы.
 */
type TEventName<TDescriptorFn> = keyof DescriptorAllEvents<TDescriptorFn>

type TControlEventName = TEventName<typeof ControlDescriptor>
type TSelectEventName = TEventName<typeof SelectDescriptor>

/** Имена событий дескриптора в рантайме — `<ns>:<имя>`, как ключи его типов. */
function eventNames(descriptor: Pick<IComponentDescriptor, 'getEvents'>): string[] {
	return descriptor.getEvents().map((name) => name.getName())
}

describe('TActionPlugin у ControlDescriptor', () => {
	it('press is public in types and runtime', () => {
		const published: TControlEventName[] = ['action:press']

		expect(eventNames(ControlDescriptor())).toEqual(expect.arrayContaining(published))
	})

	it('install и destroy нет ни в типах, ни в рантайме: это механика bundle', () => {
		// @ts-expect-error Plugin installation is internal.
		const install: TControlEventName = 'action:install'
		// @ts-expect-error Plugin creation is internal.
		const create: TControlEventName = 'action:create'
		// @ts-expect-error Plugin destruction is internal.
		const destroy: TControlEventName = 'action:destroy'

		const names = eventNames(ControlDescriptor())

		expect(names).not.toContain(create)
		expect(names).not.toContain(install)
		expect(names).not.toContain(destroy)
	})
})

describe('TSelectKeyboardPlugin у SelectDescriptor', () => {
	it('change:highlight есть и в типах, и в рантайме', () => {
		const highlight: TSelectEventName = 'keyboard:change:highlight'

		expect(eventNames(SelectDescriptor())).toContain(highlight)
	})

	it('escape нет ни в типах, ни в рантайме: его слушает TEditablePlugin внутри bundle', () => {
		// @ts-expect-error — contribution клавиатуры Select отдаёт наружу только подсветку
		const escape: TSelectEventName = 'keyboard:escape'

		expect(eventNames(SelectDescriptor())).not.toContain(escape)
	})
})

for (const [name, descriptor] of exportedDescriptors()) {
	it(name + ' does not publish plugin creation', () => {
		const names = TSurface.of(descriptor, CallbackProfile).events.map((event) =>
			event.name.getName(),
		)
		expect(
			names.filter(
				(event) =>
					event.endsWith(':create') &&
					event !== 'bundle:create' &&
					event !== 'engine:create',
			),
		).toEqual([])
	})
}

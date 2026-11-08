// @vitest-environment jsdom

/** Explicit event publication stays independent from state refresh and two-way models. */
import { afterEach, describe, expect, expectTypeOf, it, vi } from 'vitest'
import { TButton } from '@soxa-ui/core'
import { TAriaPlugin, TBasePlugin } from '@soxa-ui/plugins'
import type { TPluginEvents } from '@soxa-ui/plugins'
import {
	ButtonDescriptor,
	CommonProfile,
	TableCollectionDescriptor,
	createAdapterContext,
	defineComponent,
	definePlugin,
	TSurface,
} from '@soxa-ui/setup'
import type { DescriptorAllEvents, DescriptorEvents, TEventSink } from '@soxa-ui/setup'
import { CallbackProfile, exportedDescriptors, required } from './helpers'

const disposers: Array<() => void> = []
afterEach(() => {
	for (const dispose of disposers.splice(0)) dispose()
})

const InternalText = defineComponent({
	ctor: TButton,
	contribution: { props: { text: { type: String, triggers: ['change:text'] } } },
})

describe('explicit public events', () => {
	it('does not infer or publish a writable property trigger, while state and models still update', () => {
		expectTypeOf<keyof DescriptorEvents<typeof InternalText>>().toEqualTypeOf<never>()
		const ctrl = new TButton()
		const context = createAdapterContext(InternalText, { ctrl })
		disposers.push(() => context.destroy())
		const binding = context.connect({
			naming: CallbackProfile.naming,
			model: (name) => `update:${name}`,
		})
		const emit = vi.fn<TEventSink>()
		binding.state.subscribe(() => {})
		binding.events.listen(emit)
		expect(binding.surface.exportEvents).toEqual(['update:text'])
		expect(emit).not.toHaveBeenCalled()
		ctrl.text = 'new text'
		expect(binding.state.getSnapshot().text).toBe('new text')
		expect(emit.mock.calls).toEqual([['update:text', ['new text']]])
		ctrl.text = 'new text'
		expect(emit).toHaveBeenCalledTimes(1)
	})

	it('preserves an explicitly declared inherited event when its property becomes protected', () => {
		const parent = defineComponent({
			extends: InternalText,
			contribution: { events: ['change:text'] },
		})
		const child = defineComponent({
			extends: parent,
			contribution: { props: { text: { protected: true } } },
		})
		expectTypeOf<DescriptorEvents<typeof child>>().toHaveProperty('change:text')
		const context = createAdapterContext(child, {})
		disposers.push(() => context.destroy())
		const binding = context.connect({
			naming: CallbackProfile.naming,
			model: (name) => `update:${name}`,
		})
		const emit = vi.fn<TEventSink>()
		binding.events.listen(emit)
		context.instance.text = 'inherited'
		expect(binding.surface.exportEvents).toEqual(['onChangeText'])
		expect(emit.mock.calls).toEqual([
			['onChangeText', [{ oldValue: '', newValue: 'inherited' }]],
		])
	})

	it('refreshes plugin inputs and protected outputs without publishing their triggers', () => {
		const aria = definePlugin({
			ctor: TAriaPlugin,
			namespace: 'probe',
			contribution: {
				props: {
					label: { type: String, triggers: ['change:label'] },
					summary: {
						protected: true,
						get: (plugin: TAriaPlugin) => plugin.label,
						triggers: ['change:label'],
					},
				},
			},
		})
		const descriptor = defineComponent({ ctor: TButton, plugins: [aria] })
		expectTypeOf<keyof DescriptorAllEvents<typeof descriptor>>().toEqualTypeOf<never>()
		const context = createAdapterContext(descriptor, {})
		disposers.push(() => context.destroy())
		const binding = context.connect({
			naming: CallbackProfile.naming,
			model: (name) => `update:${name}`,
		})
		const emit = vi.fn<TEventSink>()
		binding.state.subscribe(() => {})
		binding.events.listen(emit)
		required(context.bundle?.get(TAriaPlugin), 'aria plugin').label = 'Name'
		expect(binding.state.getSnapshot()).toMatchObject({
			probe_label: 'Name',
			probe_summary: 'Name',
		})
		expect(binding.surface.exportEvents).toEqual(['update:probe_label'])
		expect(emit.mock.calls).toEqual([['update:probe_label', ['Name']]])
	})

	it('updates structural state without sending structural events or model updates', () => {
		const context = createAdapterContext(ButtonDescriptor(), {})
		disposers.push(() => context.destroy())
		const binding = context.connect(CommonProfile)
		const emit = vi.fn<TEventSink>()
		binding.state.subscribe(() => {})
		binding.events.listen(emit)
		context.instance.aria.add('aria-description', 'Description')
		expect(binding.state.getSnapshot().aria).toMatchObject({
			'aria-description': 'Description',
		})
		expect(emit).not.toHaveBeenCalled()
	})

	it('preserves Table selection as an explicit public event', () => {
		expectTypeOf<DescriptorAllEvents<typeof TableCollectionDescriptor>>().toHaveProperty(
			'change:selection',
		)
		expect(TSurface.of(TableCollectionDescriptor(), CommonProfile).exportEvents).toContain(
			'change:selection',
		)
	})

	it('does not let an earlier internal trigger steal an explicit event publisher', () => {
		type TProbeEvents = TPluginEvents & { changed: () => void }
		class TInternal extends TBasePlugin<object, TProbeEvents> {
			value = 0
		}
		class TPublic extends TBasePlugin<object, TProbeEvents> {}
		const descriptor = defineComponent({
			ctor: class {},
			plugins: [
				definePlugin({
					ctor: TInternal,
					namespace: 'probe',
					contribution: {
						props: {
							value: { protected: true, triggers: ['changed'] },
						},
					},
				}),
				definePlugin({
					ctor: TPublic,
					namespace: 'probe',
					contribution: { events: ['changed'] },
				}),
			],
		})
		const context = createAdapterContext(descriptor, {})
		disposers.push(() => context.destroy())
		const binding = context.connect(CommonProfile)
		const emit = vi.fn<TEventSink>()
		binding.events.listen(emit)
		required(context.bundle?.get(TInternal), 'internal plugin').events.emit('changed')
		expect(emit).not.toHaveBeenCalled()
		required(context.bundle?.get(TPublic), 'public plugin').events.emit('changed')
		expect(emit.mock.calls).toEqual([['probe:changed', []]])
	})
})

for (const [name, descriptor] of exportedDescriptors()) {
	it(`${name} publishes exactly its explicit declarations`, () => {
		const surface = TSurface.of(descriptor, CommonProfile)
		expect(surface.exportEvents).toEqual([
			...new Set(descriptor.getEvents().map((event) => event.getName())),
		])
		expect(surface.exportEvents).not.toEqual(expect.arrayContaining(['change:classes']))
		for (const event of surface.exportEvents) {
			expect(event).not.toMatch(
				/(?:^|:)(?:change:(?:.*(?:Aria|Dataset|Attrs)|classes|aria|dataset|attrs|styles|backdropStyles))$/,
			)
		}
	})
}

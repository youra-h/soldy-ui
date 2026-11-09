import { beforeAll, describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { TButton } from '@soxa-ui/core'
import { defineComponent, DismissPluginDescriptor } from '@soxa-ui/setup'
import expectedExports from '../public-api/exports.json'
import { root } from './discover'
import { contractOf, defaultText, generateApi } from './generate'
import type { TApi, TContractTypes, TFramework } from './types'

let api: TApi
beforeAll(async () => {
	api = await generateApi()
})

describe('public documentation artifact', () => {
	it('matches the committed contract without requiring a library build', () => {
		expect(api).toEqual(
			JSON.parse(readFileSync(resolve(root, 'docs/api/generated/contract.json'), 'utf8')),
		)
	})

	it.each<TFramework>(['vue', 'react', 'angular', 'solid', 'svelte', 'webc'])(
		'covers the public component exports of %s',
		(framework) => {
			const names = expectedExports[framework].values.filter((name) =>
				framework === 'angular'
					? /^T\w+Component$/.test(name)
					: framework === 'webc'
						? /^T\w+Element$/.test(name) && name !== 'TLocaleProviderElement'
						: /^[A-Z]/.test(name) && name !== 'LocaleProvider',
			)
			expect(
				api.components
					.flatMap((component) => component.frameworks[framework]?.exportName ?? [])
					.sort(),
			).toEqual(names.sort())
		},
	)

	it('documents actual selectors and availability instead of promising every base on every adapter', () => {
		expect(
			api.components.find((component) => component.id === 'button')?.frameworks.angular
				?.selector,
		).toBe('button[so-button], [so-button]')
		expect(
			api.components.find((component) => component.id === 'button')?.frameworks.webc
				?.selector,
		).toBe('button[is="so-button"]')
		expect(
			api.components.find((component) => component.id === 'component')?.frameworks,
		).toEqual({ angular: { exportName: 'TComponentComponent', selector: '[so-component]' } })
	})

	it('combines the field and collection contracts of Select', () => {
		const select = api.contracts.select
		expect(select.props.map((prop) => prop.name)).toEqual(
			expect.arrayContaining([
				'value',
				'items',
				'trackBy',
				'mode',
				'groups',
				'groupBy',
				'tagsOverflow',
			]),
		)
		expect(select.props.find((prop) => prop.name === 'items')?.type).toContain(
			'TCollectionEngineItemSource',
		)
		expect(select.props.find((prop) => prop.name === 'mode')?.values).toEqual([
			'none',
			'single',
			'multiple',
		])
		expect(select.events.map((event) => event.name)).toContain('change:selection')
		expect(
			api.components
				.find((component) => component.id === 'menu-submenu')
				?.sources.map((source) => source.role),
		).toEqual(['descriptor', 'facade', 'ownerFacade'])
	})

	it('keeps inherited defaults and the difference between undefined and no default', () => {
		const props = api.contracts.button.props
		expect(props.find((prop) => prop.name === 'disabled')).toMatchObject({
			default: 'false',
			hasDefault: true,
		})
		expect(props.find((prop) => prop.name === 'text')).toMatchObject({
			default: '""',
			hasDefault: true,
			type: 'string | undefined',
		})
		expect(props.find((prop) => prop.name === 'variant')).toMatchObject({
			default: 'undefined',
			hasDefault: true,
			declaredType: expect.any(String),
		})
		expect(props.find((prop) => prop.name === 'ctrl')).toMatchObject({ hasDefault: false })
		expect(props.find((prop) => prop.name === 'ctrl')).not.toHaveProperty('default')
	})

	it('excludes protected component and plugin properties, including inherited item styling', () => {
		for (const name of ['classes', 'aria', 'dataset'])
			expect(api.contracts.button.props.map((prop) => prop.name)).not.toContain(name)
		for (const name of ['size', 'variant', 'view', 'name'])
			expect(api.contracts['radio-group-item'].props.map((prop) => prop.name)).not.toContain(
				name,
			)
		expect(
			api.contracts['select-item'].props.find((prop) => prop.name === 'selected'),
		).toMatchObject({ type: 'boolean | undefined', default: 'false', required: false })
		expect(api.plugins.DismissPluginDescriptor.props.map((prop) => prop.name)).not.toContain(
			'dismiss_ownerAttribute',
		)
	})

	it('uses installation-site plugin defaults without changing the standalone plugin contract', () => {
		const original = api.plugins.DismissPluginDescriptor
		const types: TContractTypes = {
			props: new Map(original.props.map((prop) => [prop.name, prop])),
			events: new Map(
				original.events.map((event) => [event.name, { ...event, required: true }]),
			),
			slots: new Map(),
		}
		const customized = contractOf(
			DismissPluginDescriptor.with({ enabled: true }),
			types,
			'fixture',
		)
		expect(customized.props.find((prop) => prop.name === 'dismiss_enabled')?.default).toBe(
			'true',
		)
		expect(original.props.find((prop) => prop.name === 'dismiss_enabled')?.default).toBe(
			'false',
		)
	})

	it('does not inherit slots from a parent descriptor', () => {
		expect(api.contracts.input.slots.map((slot) => slot.name)).toEqual([
			'leading',
			'clear',
			'trailing',
		])
		expect(
			api.contracts.input.slots.find((slot) => slot.name === 'clear')?.scope.clear.type,
		).toBe('() => void')
		expect(
			api.contracts.button.slots.find((slot) => slot.name === 'default')?.scope.text.type,
		).toBe('string')
	})

	it('uses the real naming profiles, and separates models from public events', () => {
		const button = api.contracts.button
		expect(button.frameworks.vue.events['change:text']).toBe('@change:text')
		expect(button.frameworks.react.events['change:text']).toBe('onChangeText')
		expect(button.frameworks.solid.events['change:text']).toBe('onChangeText')
		expect(button.frameworks.svelte.events['change:text']).toBe('onChangeText')
		expect(button.frameworks.angular.events['change:text']).toBe('(soChangeText)')
		expect(button.frameworks.webc.events['change:text']).toBe(
			"addEventListener('so:change:text', handler)",
		)
		expect(button.frameworks.vue.models.text).toBe('@update:text')
		expect(button.frameworks.angular.models.text).toBe('(textChange)')
		expect(button.frameworks.react.models).toEqual({})
		expect(button.events.map((event) => event.name)).not.toContain('change:classes')
		expect(button.frameworks.angular.props).not.toHaveProperty('tag')
		expect(button.frameworks.vue.props.tag).toBe(':tag')
	})

	it('uses valid slot spellings and records the canonical scope independently', () => {
		expect(api.contracts.button.frameworks.react.slots.default.name).toBe('children')
		expect(api.contracts.button.frameworks.angular.slots.default.syntax).toBe(
			'<ng-template slot="default">',
		)
		expect(api.contracts.accordion.frameworks.svelte.slots['item-leading'].syntax).toBe(
			'item-leading={content}',
		)
		expect(api.contracts.accordion.frameworks.svelte.slots.item.syntax).toBe(
			'{#snippet item(scope)}',
		)
	})

	it('includes the external-plugin transport and its public plugin contract', () => {
		expect(api.contracts.button.props.map((prop) => prop.name)).toContain('pluginProps')
		expect(api.contracts.button.frameworks.vue.events['plugin:event']).toBe('@plugin:event')
		expect(api.contracts.button.frameworks.react.events['bundle:create']).toBe('onBundleCreate')
		expect(
			api.contracts.button.events.find((event) => event.name === 'plugin:event')?.type,
		).toContain('TPluginEvent')
		expect(api.plugins.DismissPluginDescriptor.props.map((prop) => prop.name)).toContain(
			'dismiss_enabled',
		)
	})

	it('contains no checkout paths, transient alias or nondeterministic version stamp', () => {
		const content = JSON.stringify(api)
		expect(content).not.toMatch(/[A-Z]:[\\/]|\/home\/|\/Users\/|\bSetup\./)
		expect(api).not.toHaveProperty('libraryVersion')
		for (const contract of [...Object.values(api.contracts), ...Object.values(api.plugins)]) {
			expect(contract.source).toMatch(/^packages\/setup\/content\//)
			expect(new Set(contract.props.map((prop) => prop.name)).size).toBe(
				contract.props.length,
			)
			expect(new Set(contract.events.map((event) => event.name)).size).toBe(
				contract.events.length,
			)
		}
	})
})

describe('generation invariants', () => {
	it('does not promote triggers into public events, but retains model updates', () => {
		const descriptor = defineComponent({
			ctor: TButton,
			contribution: {
				props: {
					text: { type: String, triggers: ['change:text'] },
					classes: { type: Array, protected: true, triggers: ['change:classes'] },
				},
			},
		})
		const types: TContractTypes = {
			props: new Map([['text', { type: 'string', required: false }]]),
			events: new Map(),
			slots: new Map(),
		}
		const contract = contractOf(descriptor, types, 'fixture')
		expect(contract.events).toEqual([])
		expect(contract.frameworks.vue.models).toEqual({ text: '@update:text' })
		expect(contract.props.map((prop) => prop.name)).toEqual(['text'])
	})

	it('fails on missing types rather than silently substituting Object or unknown', () => {
		const descriptor = defineComponent({
			ctor: TButton,
			contribution: { props: { text: { type: String } } },
		})
		expect(() =>
			contractOf(
				descriptor,
				{ props: new Map(), events: new Map(), slots: new Map() },
				'fixture',
			),
		).toThrow('Missing precise property')
	})

	it.each([
		[undefined, 'undefined'],
		[null, 'null'],
		[false, 'false'],
		[0, '0'],
		['', '""'],
		[Infinity, 'Infinity'],
		[NaN, 'NaN'],
		[[undefined, false], '[undefined, false]'],
		[{ value: undefined }, '{ "value": undefined }'],
	])('preserves default %s in display expressions', (value, expected) => {
		expect(defaultText(value)).toBe(expected)
	})
})

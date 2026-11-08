// @vitest-environment jsdom

/**
 * Доступ к плагинам снаружи.
 *
 * В soxa компонентом управляют с двух сторон — декларативно (шаблон) и
 * императивно (инстанс). Для props и событий ядра обе стороны равнозначны;
 * эти тесты сторожат ту же равнозначность для плагинов.
 */

import { describe, it, expect, vi } from 'vitest'
import { TButton } from '@soxa-ui/core'
import { TBasePlugin, TElementPlugin, TPluginBundle, TReadyPlugin } from '@soxa-ui/plugins'
import { createAdapterContext, ButtonDescriptor, ComponentDescriptor } from '@soxa-ui/setup'
import { CallbackProfile, required } from './helpers'

/**
 * Сборка набора (`assembleBundle`) откладывает эмит на микрозадачу — иначе
 * адаптер, который получает bundle из createAdapterContext, не успел бы
 * подписаться.
 */
const created = () => Promise.resolve()

describe('bundle:create — сторона инстанса', () => {
	it('отдаёт bundle тому, у кого на руках только ctrl', async () => {
		const ctrl = new TButton()
		const seen: unknown[] = []

		// Подписка ДО монтирования: инстанс уже существует, плагинов ещё нет
		ctrl.events.on('bundle:create', (bundle: unknown) => seen.push(bundle))

		const context = createAdapterContext(ButtonDescriptor(), { ctrl })

		await created()

		expect(seen).toHaveLength(1)
		expect(seen[0]).toBe(context.bundle)
	})

	it('через bundle можно подписаться на события конкретного плагина', async () => {
		const ctrl = new TButton()
		const node = document.createElement('button')
		let element: unknown = null

		// Ровно тот сценарий, ради которого всё затевалось: на руках только
		// ctrl, а нужен DOM-элемент, который знает только плагин
		ctrl.events.on('bundle:create', (bundle: unknown) => {
			if (!(bundle instanceof TPluginBundle)) return

			bundle.get(TElementPlugin)?.events.on('ready', (el: unknown) => (element = el))
		})

		const context = createAdapterContext(ButtonDescriptor(), { ctrl })

		await created()

		// TElementPlugin отдаёт `ready` через rAF, поэтому проверяем синхронный путь
		required(context.bundle?.get(TElementPlugin), 'TElementPlugin').events.emit('ready', node)

		expect(element).toBe(node)
	})

	it('на каждое монтирование приходит свой bundle', async () => {
		const ctrl = new TButton()
		const seen: unknown[] = []

		ctrl.events.on('bundle:create', (bundle: unknown) => seen.push(bundle))

		const first = createAdapterContext(ButtonDescriptor(), { ctrl })
		const second = createAdapterContext(ButtonDescriptor(), { ctrl })

		await created()

		expect(seen).toEqual([first.bundle, second.bundle])
		expect(seen[0]).not.toBe(seen[1])
	})

	it('набор контекста, уничтоженного до микрозадачи, не объявляется', async () => {
		const ctrl = new TButton()
		const seen: unknown[] = []

		ctrl.events.on('bundle:create', (bundle: unknown) => seen.push(bundle))

		// Размонтирование раньше объявления: так React под StrictMode уничтожает
		// первый контекст и собирает второй с тем же ctrl
		const destroyed = createAdapterContext(ButtonDescriptor(), { ctrl })
		const onElementCreate = vi.fn()

		required(destroyed.bundle?.get(TElementPlugin), 'TElementPlugin').events.on(
			'create',
			onElementCreate,
		)
		destroyed.destroy()

		const live = createAdapterContext(ButtonDescriptor(), { ctrl })

		await created()

		// Подписчик поставил бы в уничтоженный набор плагин, который уже некому уничтожить
		expect(seen).toEqual([live.bundle])
		expect(onElementCreate).not.toHaveBeenCalled()
	})

	it('не эмитится, если у дескриптора нет плагинов', async () => {
		const context = createAdapterContext(ComponentDescriptor(), {})
		const handler = vi.fn()

		context.instance.events.on('bundle:create', handler)

		await created()

		expect(context.bundle).toBeNull()
		expect(handler).not.toHaveBeenCalled()
	})
})

/** Плагин снаружи: журнал своего жизненного цикла. */
class TExternalPlugin extends TBasePlugin {
	readonly log: string[] = []

	override created(): void {
		super.created()
		this.log.push('create')
	}

	override destroy(): void {
		this.log.push('destroy')
		super.destroy()
	}
}

describe('плагин, поставленный снаружи', () => {
	it('поставленный в bundle:create объявляется вместе с плагинами дескриптора', async () => {
		const ctrl = new TButton()
		const order: string[] = []

		ctrl.events.on('bundle:create', (bundle: unknown) => {
			if (!(bundle instanceof TPluginBundle)) return

			bundle.use(TExternalPlugin)
			bundle.get(TExternalPlugin)?.events.on('create', () => order.push('external'))
			bundle.get(TElementPlugin)?.events.on('create', () => order.push('element'))
		})

		const context = createAdapterContext(ButtonDescriptor(), { ctrl })

		await created()

		expect(context.bundle?.get(TExternalPlugin)?.log).toEqual(['create'])
		// Порядок установки: плагины дескриптора раньше внешнего
		expect(order).toEqual(['element', 'external'])
	})

	it('уничтожается вместе с компонентом', async () => {
		const context = createAdapterContext(ButtonDescriptor(), {})
		const bundle = required(context.bundle, 'bundle')

		bundle.use(TExternalPlugin)
		const plugin = required(bundle.get(TExternalPlugin), 'TExternalPlugin')

		await created()
		context.destroy()

		expect(plugin.log).toEqual(['create', 'destroy'])
		expect(bundle.get(TElementPlugin)).toBeUndefined()
	})

	it('чужой набор контекст не уничтожает: его уничтожит владелец', async () => {
		const owner = createAdapterContext(ButtonDescriptor(), {})
		const bundle = required(owner.bundle, 'bundle')
		const shared = createAdapterContext(
			ButtonDescriptor(),
			{ ctrl: owner.instance },
			{ bundle },
		)

		await created()
		shared.destroy()

		expect(bundle.get(TElementPlugin)).toBeInstanceOf(TElementPlugin)

		owner.destroy()

		expect(bundle.get(TElementPlugin)).toBeUndefined()
	})
})

describe('plugin lifecycle stays internal', () => {
	it('does not publish plugin create events', async () => {
		const context = createAdapterContext(ButtonDescriptor(), {})
		const emitted: string[] = []
		context.connect(CallbackProfile).events.listen((name) => emitted.push(name))
		await created()
		expect(emitted).toContain('onBundleCreate')
		expect(emitted).not.toContain('onElementCreate')
		expect(emitted).not.toContain('onReadyCreate')
		context.destroy()
	})

	it('bundle:create приходит раньше плагинных create', async () => {
		const context = createAdapterContext(ButtonDescriptor(), {})
		const order: string[] = []

		context.instance.events.on('bundle:create', () => order.push('bundle'))
		required(context.bundle?.get(TElementPlugin), 'TElementPlugin').events.on('create', () =>
			order.push('element'),
		)
		required(context.bundle?.get(TReadyPlugin), 'TReadyPlugin').events.on('create', () =>
			order.push('ready'),
		)

		await created()

		// Иначе обработчик bundle:create не успел бы подписаться на плагинный create
		expect(order[0]).toBe('bundle')
		expect(order).toContain('element')
		expect(order).toContain('ready')
	})
})

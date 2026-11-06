/**
 * TSurface describes the public component API for one descriptor and framework profile.
 *
 * Only explicit event declarations are public; property triggers drive state and models.
 */

import type { TName, TPropSpec } from '../../define'
import type { IAdapterProfile } from '../../naming'
import { resolveSlotName } from '../common/slots'
import type { ISurfaceEvent, ISurfaceProp, ISurfaceSource, TSurfacePropConfig } from './types'

const surfaces = new WeakMap<ISurfaceSource, WeakMap<IAdapterProfile, TSurface>>()

function exportConfig(spec: TPropSpec): TSurfacePropConfig {
	return {
		...(spec.type !== undefined ? { type: spec.type } : {}),
		...(spec.hasDefault ? { default: spec.default } : {}),
	}
}

export class TSurface {
	/** Все свойства, в порядке объявления: свои, затем плагинов. */
	readonly props: readonly ISurfaceProp[]
	/** Only explicitly declared component and plugin events are public. */
	readonly events: readonly ISurfaceEvent[]
	/** Статический слой: пропсы, записываемые снаружи, с типом и умолчанием. */
	readonly exportProps: Readonly<Record<string, TSurfacePropConfig>>
	/** Статический слой: имена событий и событий привязки, без повторов. */
	readonly exportEvents: readonly string[]
	/** Имена, которые компонент «съедает»: остальное React, Solid и Svelte отдают в корневой узел. */
	readonly consumed: ReadonlySet<string>

	private readonly _byName: ReadonlyMap<TName, ISurfaceProp>

	/** Поверхность описания в профиле фреймворка; строится один раз на пару. */
	static of(source: ISurfaceSource, profile: IAdapterProfile): TSurface {
		let byProfile = surfaces.get(source)

		if (!byProfile) {
			byProfile = new WeakMap()
			surfaces.set(source, byProfile)
		}

		let surface = byProfile.get(profile)

		if (!surface) {
			surface = new TSurface(source, profile)
			byProfile.set(profile, surface)
		}

		return surface
	}

	private constructor(source: ISurfaceSource, profile: IAdapterProfile) {
		const { naming, defaultSlot, model } = profile

		this.props = source.getProps().map((spec) => {
			const exportName = naming.prop(spec.name)
			const bound = model && !spec.protected && spec.triggers.length > 0

			return bound ? { spec, exportName, model: model(exportName) } : { spec, exportName }
		})
		this._byName = new Map(this.props.map((prop) => [prop.spec.name, prop]))

		const published = new Map<string, TName>()

		for (const name of source.getEvents()) {
			if (!published.has(name.getName())) published.set(name.getName(), name)
		}

		this.events = [...published.values()].map((name) => ({
			name,
			exportName: naming.event(name),
		}))

		this.exportProps = Object.fromEntries(
			this.props
				.filter((prop) => !prop.spec.protected)
				.map((prop) => [prop.exportName, exportConfig(prop.spec)]),
		)

		this.exportEvents = [
			...new Set([
				...this.events.map((event) => event.exportName),
				...this.props.flatMap((prop) => (prop.model === undefined ? [] : [prop.model])),
			]),
		]

		const consumed = new Set<string>(['ctrl', 'embedded'])

		for (const prop of this.props) {
			consumed.add(prop.exportName)
			consumed.add(prop.spec.name.name)
		}

		for (const event of this.events) consumed.add(event.exportName)

		for (const slot of source.slots ?? []) {
			consumed.add(defaultSlot ? resolveSlotName(slot.name, defaultSlot) : slot.name)
		}

		if (defaultSlot) consumed.add(defaultSlot)

		this.consumed = consumed

		Object.freeze(this)
	}

	/**
	 * Запись поверхности по описанию — так обмен получает имя для своей линии.
	 *
	 * Ключ — объект имени (`TName`), а не строка и не само описание: имя создаётся
	 * один раз на объявление и переживает пересчёт умолчаний (`rebase`), поэтому
	 * описание наследника и описание с умолчанием владельца находят ту же запись.
	 */
	entryOf(spec: TPropSpec): ISurfaceProp | undefined {
		return this._byName.get(spec.name)
	}

	/** Пропсы, которые компонент не съел: уходят атрибутами в корневой узел. */
	forward<TProps extends object>(props: TProps): Partial<TProps> {
		const rest: Partial<TProps> = {}

		for (const key of Object.keys(props)) {
			if (!this.consumed.has(key)) Reflect.set(rest, key, Reflect.get(props, key))
		}

		return rest
	}
}

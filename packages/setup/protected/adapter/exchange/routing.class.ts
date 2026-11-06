/**
 * TRouting shares property lines and event routes across mounts of the same participant descriptions.
 * Internal triggers refresh state and models independently of explicitly published events.
 */

import type { TSurface } from '../surface'
import { TLine } from './line.class'
import type { TMember } from './member.class'
import type { IMemberSpec, IModelRoute, IRoute } from './types'

/** Маршрут, пока таблица строится. */
interface IRouteDraft {
	readonly cells: number[]
	event?: string
	models: readonly IModelRoute[]
}

/** Узел дерева таблиц поверхности: путь к нему — описания участников по порядку. */
interface INode {
	routing?: TRouting
	readonly next: WeakMap<IMemberSpec, INode>
}

const roots = new WeakMap<TSurface, INode>()

export class TRouting {
	/** Линии состава: свойства участников в поверхности. */
	readonly lines: readonly TLine[]
	/** Линии с триггерами: значение состояния `i` — линия `readable[i]`. */
	readonly readable: readonly TLine[]
	/** Записываемые линии: значение входа `i` — линия `writable[i]`. */
	readonly writable: readonly TLine[]
	/**
	 * Маршруты участников по порядку состава: сырое имя на шине участника →
	 * маршрут. У участника, с событиями которого обмену делать нечего, —
	 * `undefined`: его шину обмен не слушает.
	 */
	readonly routes: readonly (ReadonlyMap<string, IRoute> | undefined)[]

	/** Таблица поверхности для состава участников монтирования; строится один раз на пару. */
	static of(surface: TSurface, members: readonly TMember[]): TRouting {
		let node: INode | undefined = roots.get(surface)

		if (!node) {
			node = { next: new WeakMap() }
			roots.set(surface, node)
		}

		for (const { spec } of members) {
			let next: INode | undefined = node.next.get(spec)

			if (!next) {
				next = { next: new WeakMap() }
				node.next.set(spec, next)
			}

			node = next
		}

		node.routing ??= new TRouting(
			surface,
			members.map((member) => member.spec),
		)

		return node.routing
	}

	private constructor(surface: TSurface, specs: readonly IMemberSpec[]) {
		const lines: TLine[] = []
		const readable: TLine[] = []
		const writable: TLine[] = []
		const drafts = specs.map(() => new Map<string, IRouteDraft>())

		const draftOf = (member: number, raw: string): IRouteDraft => {
			const routes = drafts[member]
			let draft = routes.get(raw)

			if (!draft) {
				draft = { cells: [], models: [] }
				routes.set(raw, draft)
			}

			return draft
		}

		specs.forEach((spec, member) => {
			for (const prop of spec.props) {
				const entry = surface.entryOf(prop)

				if (!entry) continue

				const line = new TLine(prop, member, entry.exportName)

				lines.push(line)

				if (!prop.protected) writable.push(line)
				if (prop.triggers.length === 0) continue

				const cell = readable.length

				readable.push(line)

				for (const trigger of prop.triggers) {
					const draft = draftOf(member, trigger.name)
					const { cells } = draft

					if (!cells.includes(cell)) cells.push(cell)

					if (
						entry.model !== undefined &&
						!draft.models.some((model) => model.name === entry.model)
					) {
						draft.models = [...draft.models, { line, name: entry.model }]
					}
				}
			}
		})

		const publishers = new Map<string, number>()

		specs.forEach((spec, member) => {
			for (const name of spec.events) {
				if (!publishers.has(name.getName())) publishers.set(name.getName(), member)
			}
		})

		for (const event of surface.events) {
			const member = publishers.get(event.name.getName())

			// Событие, у которого нет участника (плагина нет в чужом наборе), маршрута не получает
			if (member === undefined) continue

			const draft = draftOf(member, event.name.name)

			draft.event = event.exportName
		}

		this.lines = Object.freeze(lines)
		this.readable = Object.freeze(readable)
		this.writable = Object.freeze(writable)
		this.routes = Object.freeze(
			drafts.map((routes) =>
				routes.size === 0
					? undefined
					: new Map(
							[...routes].map(([raw, { cells, event, models }]): [string, IRoute] => [
								raw,
								Object.freeze({
									cells: Object.freeze(cells),
									...(event === undefined ? {} : { event }),
									models: Object.freeze(models),
								}),
							]),
						),
			),
		)
	}
}

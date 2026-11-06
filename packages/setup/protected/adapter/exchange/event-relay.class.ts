/**
 * TEventRelay delivers explicit public events and model updates after state refresh.
 * Models are delivered even when their source trigger is internal.
 */

import type { TTap } from './tap.class'
import type { IRoute, TEventSink } from './types'

export class TEventRelay {
	/** Приёмники — пока есть хоть один. Список не правится на месте: событие обходит тот, что застало. */
	private _sinks?: readonly TEventSink[]

	/**
	 * @param _owners владельцы участников монтирования — у них модели читают новое значение
	 * @param _tap слушатель участников, общий с состоянием обмена
	 */
	constructor(
		private readonly _owners: readonly object[],
		private readonly _tap: TTap,
	) {}

	listen(sink: TEventSink): () => void {
		if (this._sinks === undefined) this._tap.hold()

		// Литерал, а не спред в пустой список: у массива, собранного по элементу,
		// запас под рост, а приёмник у обмена обычно один
		this._sinks = this._sinks ? [...this._sinks, sink] : [sink]

		let listening = true

		return () => {
			const sinks = this._sinks
			const index = sinks?.indexOf(sink) ?? -1

			if (!listening || sinks === undefined || index === -1) return

			listening = false
			this._sinks =
				sinks.length === 1
					? undefined
					: [...sinks.slice(0, index), ...sinks.slice(index + 1)]

			if (this._sinks === undefined) this._tap.release()
		}
	}

	/** Deliver an explicit public event and model updates independently, after refreshing state. */
	publish(route: IRoute, args: readonly unknown[]): void {
		this._deliver(route, args, this._sinks)
	}

	/**
	 * Событие случилось, а отдать его обмен должен позже (`TExchange`, чужая
	 * сборка): доставка — тем приёмникам, что слушали в момент события. Приёмник,
	 * снятый до доставки, событие получает — оно случилось при нём; пришедший
	 * после — нет: для него это начальное состояние. Список не правится на
	 * месте, поэтому запомнить его — запомнить ссылку.
	 */
	later(route: IRoute, args: readonly unknown[]): () => void {
		const sinks = this._sinks

		return () => this._deliver(route, args, sinks)
	}

	private _deliver(
		route: IRoute,
		args: readonly unknown[],
		sinks: readonly TEventSink[] | undefined,
	): void {
		const { event, models } = route

		if (sinks === undefined) return

		for (const sink of sinks) {
			if (event !== undefined) sink(event, args)

			for (const model of models) sink(model.name, [model.line.read(this._owners)])
		}
	}
}

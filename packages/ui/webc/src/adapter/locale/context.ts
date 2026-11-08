import type { ILocaleSource } from '@soxa-ui/plugins'
import { TPlaceContext } from '../context'

const LOCALE = new TPlaceContext<ILocaleSource>()

export function provideLocale(provider: Element, source: ILocaleSource): void {
	LOCALE.provide(provider, source)
}

/** Провайдера нет — `undefined`, и у набора своя английская. */
export function nearestLocale(node: Node): ILocaleSource | undefined {
	return LOCALE.nearest(node)
}

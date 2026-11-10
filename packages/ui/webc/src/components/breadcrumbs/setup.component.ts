import { BreadcrumbsDescriptor, TBreadcrumbsExtension } from '@soxa-ui/setup'
import type { IBreadcrumbs } from '@soxa-ui/core'
import { createWebcAdapterContext, useAdapter, type TUpdateListener } from '../../adapter'

const wiring = new WeakMap<HTMLElement, TBreadcrumbsExtension>()
export function breadcrumbsMenuOf(host: HTMLElement) {
	return wiring.get(host)?.menu
}
export function setupBreadcrumbs(
	host: HTMLElement,
	ctrl: IBreadcrumbs | undefined,
	props: Record<string, unknown>,
	onUpdate: TUpdateListener,
) {
	const adapter = createWebcAdapterContext(host, BreadcrumbsDescriptor(), { ctrl, props })

	wiring.set(host, new TBreadcrumbsExtension(adapter))
	adapter.events.on('destroy', () => wiring.delete(host))

	return useAdapter(adapter, host, onUpdate)
}

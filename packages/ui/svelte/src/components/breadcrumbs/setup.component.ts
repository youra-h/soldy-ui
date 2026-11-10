import { BreadcrumbsDescriptor, TBreadcrumbsExtension } from '@soxa-ui/setup'
import { createSvelteAdapterContext, useAdapter, type TRootReceiver } from '../../adapter'
import type { BreadcrumbsProps } from './base.component'

export function setupBreadcrumbs(
	getProps: () => BreadcrumbsProps,
	mountId: string,
	receive: TRootReceiver,
) {
	const adapter = createSvelteAdapterContext(BreadcrumbsDescriptor(), {
		ctrl: getProps().ctrl,
		props: getProps(),
		mountId,
	})
	const wiring = new TBreadcrumbsExtension(adapter)

	return Object.assign(useAdapter(adapter, getProps, receive), { menu: wiring.menu })
}

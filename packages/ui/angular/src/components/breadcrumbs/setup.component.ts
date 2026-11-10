import { BreadcrumbsDescriptor, TBreadcrumbsExtension } from '@soxa-ui/setup'
import type { IBreadcrumbs } from '@soxa-ui/core'
import { createAngularAdapterContext, useAdapter } from '../../adapter'

export function setupBreadcrumbs(ctrl: IBreadcrumbs | undefined, props: object) {
	const adapter = createAngularAdapterContext(BreadcrumbsDescriptor(), { ctrl, props })
	const wiring = new TBreadcrumbsExtension(adapter)

	return Object.assign(useAdapter(adapter), { menu: wiring.menu })
}

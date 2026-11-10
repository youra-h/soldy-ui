import { BreadcrumbsDescriptor, TBreadcrumbsExtension } from '@soxa-ui/setup'
import { createSolidAdapterContext, useAdapter } from '../../adapter'
import type { BreadcrumbsProps } from './base.component'

export function setupBreadcrumbs(props: BreadcrumbsProps) {
	const adapter = createSolidAdapterContext(BreadcrumbsDescriptor(), { ctrl: props.ctrl, props })
	const wiring = new TBreadcrumbsExtension(adapter)

	return { ...useAdapter(adapter, props), menu: wiring.menu }
}

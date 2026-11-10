import { BreadcrumbsDescriptor, TBreadcrumbsExtension } from '@soxa-ui/setup'
import { useAdapter, useAdapterContext } from '../../adapter'
import type { BreadcrumbsProps } from './base.component'

export function useSetupBreadcrumbs(props: BreadcrumbsProps) {
	const { contexts: adapter } = useAdapterContext((create) =>
		create(BreadcrumbsDescriptor(), { ctrl: props.ctrl, props }).use(TBreadcrumbsExtension),
	)

	return { ...useAdapter(adapter, props), menu: adapter.get(TBreadcrumbsExtension)?.menu }
}

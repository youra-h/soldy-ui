import {
	TCollectionItemExtension,
	BreadcrumbsCollectionItemDescriptor,
	BreadcrumbsItemDescriptor,
} from '@soxa-ui/setup'
import { useAdapter, useAdapterContext, useCollectionAdapter } from '../../../adapter'
import type { BreadcrumbsItemProps } from './base.component'

export function useSetupBreadcrumbsItem(props: BreadcrumbsItemProps) {
	const {
		contexts: [adapter, item],
	} = useAdapterContext((create, elevator) => {
		const adapter = create(BreadcrumbsItemDescriptor(), { ctrl: props.ctrl, props })

		const item = create(
			BreadcrumbsCollectionItemDescriptor(),
			{ props },
			{ bundle: adapter.bundle },
		).use(TCollectionItemExtension, { adapter, elevator })

		return [adapter, item] as const
	})

	return {
		...useCollectionAdapter(useAdapter(adapter, props), item, props),
		context: item.instance.context,
	}
}

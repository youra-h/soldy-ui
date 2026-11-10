import {
	TCollectionExtension,
	BreadcrumbsCollectionDescriptor,
	BreadcrumbsDescriptor,
} from '@soxa-ui/setup'
import { useAdapter, useAdapterContext, useCollectionAdapter } from '../../adapter'
import type { BreadcrumbsProps } from './base.component'

export function useSetupBreadcrumbs(props: BreadcrumbsProps) {
	const {
		contexts: [adapter, collectionAdapter],
		layer,
	} = useAdapterContext((create, elevator) => {
		const adapter = create(BreadcrumbsDescriptor(), { ctrl: props.ctrl, props })

		const collectionAdapter = create(
			BreadcrumbsCollectionDescriptor(),
			{
				props,
				options: { owner: adapter.instance, engine: props.engine },
			},
			{ bundle: adapter.bundle },
		).use(TCollectionExtension, { elevator })

		return [adapter, collectionAdapter] as const
	})

	return {
		...useCollectionAdapter(useAdapter(adapter, props), collectionAdapter, props),
		layer,
	}
}

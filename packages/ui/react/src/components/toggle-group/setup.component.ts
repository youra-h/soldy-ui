import {
	ToggleGroupCollectionDescriptor,
	ToggleGroupDescriptor,
	TCollectionExtension,
} from '@soxa-ui/setup'
import { useAdapter, useAdapterContext, useCollectionAdapter } from '../../adapter'
import type { ToggleGroupProps } from './base.component'

export function useSetupToggleGroup(props: ToggleGroupProps) {
	const {
		contexts: [adapter, collectionAdapter],
		layer,
	} = useAdapterContext((create, elevator) => {
		const adapter = create(ToggleGroupDescriptor(), { ctrl: props.ctrl, props })

		const collectionAdapter = create(
			ToggleGroupCollectionDescriptor(),
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

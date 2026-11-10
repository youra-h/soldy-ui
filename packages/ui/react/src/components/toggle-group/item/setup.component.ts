import {
	ToggleGroupCollectionItemDescriptor,
	ToggleGroupItemDescriptor,
	TCollectionItemExtension,
} from '@soxa-ui/setup'
import { useAdapter, useAdapterContext, useCollectionAdapter } from '../../../adapter'
import type { ToggleGroupItemProps } from './base.component'

export function useSetupToggleGroupItem(props: ToggleGroupItemProps) {
	const {
		contexts: [adapter, item],
	} = useAdapterContext((create, elevator) => {
		const adapter = create(ToggleGroupItemDescriptor(), { ctrl: props.ctrl, props })

		const item = create(
			ToggleGroupCollectionItemDescriptor(),
			{ props },
			{ bundle: adapter.bundle },
		).use(TCollectionItemExtension, { adapter, elevator })

		return [adapter, item] as const
	})

	const owner = useAdapter(adapter, props)
	const { forwardProps, state } = useCollectionAdapter(owner, item, props)

	return {
		...owner,
		forwardProps,
		state,

		context: item.instance.context,
	}
}

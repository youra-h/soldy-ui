import {
	BreadcrumbsItemDescriptor,
	BreadcrumbsCollectionItemDescriptor,
	TCollectionItemExtension,
} from '@soxa-ui/setup'
import {
	useAdapter,
	joinBindings,
	extendBinding,
	useCollectionAdapter,
	useExpose,
	useSplitAttrs,
	createVueAdapterContext,
	VueElevatorFactory,
	type SetupContext,
} from '../../../adapter'
import BaseBreadcrumbsItem, { type BreadcrumbsItemProps } from './base.component'

/**
 * Pair native-link state with the facade that registers this item in its nearest trail.
 * Collapsing is a computed display output, so the registered item keeps its own lifetime.
 */
export default {
	name: '_BreadcrumbsItem',
	inheritAttrs: false,
	extends: BaseBreadcrumbsItem,
	expose: useExpose(),
	setup(props: BreadcrumbsItemProps, { emit }: SetupContext) {
		const adapter = createVueAdapterContext(BreadcrumbsItemDescriptor(), {
			ctrl: props.ctrl,
			props,
		})

		const item = createVueAdapterContext(
			BreadcrumbsCollectionItemDescriptor(),
			{ props },
			{ bundle: adapter.bundle },
		).use(TCollectionItemExtension, { adapter, elevator: VueElevatorFactory })

		const itemBinding = useCollectionAdapter(item, props, emit)
		const ownerBinding = useAdapter(adapter, props, emit)

		return extendBinding(joinBindings(ownerBinding, itemBinding), useSplitAttrs())
	},
}

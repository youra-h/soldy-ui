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
		return extendBinding(
			joinBindings(useAdapter(adapter, props, emit), itemBinding),
			useSplitAttrs(),
		)
	},
}

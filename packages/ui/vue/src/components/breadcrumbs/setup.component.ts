import {
	BreadcrumbsDescriptor,
	BreadcrumbsCollectionDescriptor,
	TCollectionExtension,
} from '@soxa-ui/setup'
import {
	useAdapter,
	joinBindings,
	useCollectionAdapter,
	useExpose,
	createVueAdapterContext,
	VueElevatorFactory,
	type SetupContext,
} from '../../adapter'
import BaseBreadcrumbs, { type BreadcrumbsProps } from './base.component'
export default {
	name: '_Breadcrumbs',
	extends: BaseBreadcrumbs,
	expose: useExpose(),
	setup(props: BreadcrumbsProps, { emit }: SetupContext) {
		const adapter = createVueAdapterContext(BreadcrumbsDescriptor(), {
			ctrl: props.ctrl,
			props,
		})
		const collectionAdapter = createVueAdapterContext(
			BreadcrumbsCollectionDescriptor(),
			{ props, options: { owner: adapter.instance, engine: props.engine } },
			{ bundle: adapter.bundle },
		).use(TCollectionExtension, { elevator: VueElevatorFactory })
		const collectionBinding = useCollectionAdapter(collectionAdapter, props, emit)
		return joinBindings(useAdapter(adapter, props, emit), collectionBinding)
	},
}

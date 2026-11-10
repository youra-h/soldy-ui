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

/**
 * Join the landmark model and the item collection through one shared plugin bundle.
 * The collection facade completes a supplied engine or creates its own; the standard
 * collection extension scopes item registration and owner binding to this mounting.
 * Activation and windowing stay in core. The overflow Menu supplies keyboard handling
 * and dismissal; the Breadcrumbs focus plugin restores focus after trail changes.
 */
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
			{
				props,
				options: { owner: adapter.instance, engine: props.engine },
			},
			{ bundle: adapter.bundle },
		).use(TCollectionExtension, { elevator: VueElevatorFactory })

		const collectionBinding = useCollectionAdapter(collectionAdapter, props, emit)
		const ownerBinding = useAdapter(adapter, props, emit)

		return joinBindings(ownerBinding, collectionBinding)
	},
}

import { BreadcrumbsDescriptor, TBreadcrumbsExtension } from '@soxa-ui/setup'
import {
	useAdapter,
	extendBinding,
	useExpose,
	createVueAdapterContext,
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
		const wiring = new TBreadcrumbsExtension(adapter)
		return extendBinding(useAdapter(adapter, props, emit), { menu: wiring.menu })
	},
}

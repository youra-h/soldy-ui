import { AlertDescriptor } from '@soxa-ui/setup'
import {
	useAdapter,
	useExpose,
	extendBinding,
	roleIcon,
	createVueAdapterContext,
	type SetupContext,
} from '../../adapter'
import BaseAlert, { type AlertProps } from './base.component'

export default {
	name: '_Alert',
	extends: BaseAlert,
	expose: useExpose(),

	setup(props: AlertProps, { emit }: SetupContext) {
		const adapter = createVueAdapterContext(AlertDescriptor(), { ctrl: props.ctrl, props })

		return extendBinding(useAdapter(adapter, props, emit), {
			alert: adapter.instance,
			closeIconTag: roleIcon('close'),
		})
	},
}

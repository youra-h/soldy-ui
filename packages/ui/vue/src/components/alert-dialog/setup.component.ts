import { AlertDialogDescriptor } from '@soxa-ui/setup'
import {
	createVueAdapterContext,
	useAdapter,
	useExpose,
	exposeRoot,
	extendBinding,
	roleIcon,
	type SetupContext,
} from '../../adapter'
import BaseAlertDialog, { type AlertDialogProps } from './base.component'

export default {
	name: '_AlertDialog',
	extends: BaseAlertDialog,
	expose: useExpose(),
	setup(props: AlertDialogProps, { emit, expose }: SetupContext) {
		const adapter = createVueAdapterContext(AlertDialogDescriptor(), {
			ctrl: props.ctrl,
			props,
		})
		const binding = useAdapter(adapter, props, emit)

		exposeRoot(expose, binding.rootElement)

		return extendBinding(binding, { dialog: adapter.instance, closeIconTag: roleIcon('close') })
	},
}

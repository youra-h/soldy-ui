import { InputDescriptor, TFieldControlExtension } from '@soxa-ui/setup'
import {
	createSvelteAdapterContext,
	useAdapter,
	useElevator,
	type TRootReceiver,
} from '../../adapter'
import type { InputProps } from './base.component'

export function setupInput(getProps: () => InputProps, mountId: string, receive: TRootReceiver) {
	const elevator = useElevator()
	const adapter = createSvelteAdapterContext(InputDescriptor(), {
		ctrl: getProps().ctrl,
		props: getProps(),
		mountId,
	}).use(TFieldControlExtension, { elevator })

	return useAdapter(adapter, getProps, receive)
}

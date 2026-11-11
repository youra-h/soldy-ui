import { AlertDescriptor } from '@soxa-ui/setup'
import { useComponent } from '../../adapter'
import type { AlertProps } from './base.component'

export function useSetupAlert(props: AlertProps) {
	return useComponent((create) => create(AlertDescriptor(), { ctrl: props.ctrl, props }), props)
}

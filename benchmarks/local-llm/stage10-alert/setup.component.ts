import type { AlertProps } from './base.component'
import { AlertDescriptor, useComponent } from './api'

export function useSetupAlert(props: AlertProps) {
  return useComponent(create => create(AlertDescriptor(), { ctrl: props.ctrl, props }), props)
}

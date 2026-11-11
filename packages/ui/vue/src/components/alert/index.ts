import type { TClosedComponent } from '../../adapter'
import AlertComponent from './Alert.vue'

export { default as BaseAlert, propsAlert, emitsAlert } from './base.component'
export type { AlertProps } from './base.component'

export const Alert: TClosedComponent<typeof AlertComponent> = AlertComponent

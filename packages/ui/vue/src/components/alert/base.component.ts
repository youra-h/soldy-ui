import { useEmits, useProps } from '../../adapter'
import type { TEmits, TProps, UseProps } from '../../types/common'
import { AlertDescriptor } from '@soxa-ui/setup'
import type { IAlert } from '@soxa-ui/core'

export const emitsAlert: TEmits = useEmits(AlertDescriptor())
export const propsAlert: TProps = useProps(AlertDescriptor()) as TProps
export type AlertProps = UseProps<typeof AlertDescriptor, IAlert>

export default { name: 'BaseAlert', emits: emitsAlert, props: propsAlert }

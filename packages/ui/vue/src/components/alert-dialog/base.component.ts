import { useEmits, useProps } from '../../adapter'
import type { TEmits, TProps, UseProps } from '../../types/common'
import { AlertDialogDescriptor } from '@soxa-ui/setup'
import type { IAlertDialog } from '@soxa-ui/core'

export const emitsAlertDialog: TEmits = useEmits(AlertDialogDescriptor())

export const propsAlertDialog: TProps = useProps(AlertDialogDescriptor()) as TProps

export type AlertDialogProps = UseProps<typeof AlertDialogDescriptor, IAlertDialog>

export default {
	name: 'BaseAlertDialog',
	emits: emitsAlertDialog,
	props: propsAlertDialog,
}

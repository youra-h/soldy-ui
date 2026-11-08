import { useEmits, useProps } from '../../adapter'
import type { TEmits, TProps, UseProps } from '../../types/common'
import { DialogDescriptor } from '@soxa-ui/setup'
import type { IDialog } from '@soxa-ui/core'

export const emitsDialog: TEmits = useEmits(DialogDescriptor())

export const propsDialog: TProps = useProps(DialogDescriptor()) as TProps

export type DialogProps = UseProps<typeof DialogDescriptor, IDialog>

export default {
	name: 'BaseDialog',
	emits: emitsDialog,
	props: propsDialog,
}

import { AlertDialogDescriptor } from '@soxa-ui/setup'
import type { IAlertDialog } from '@soxa-ui/core'
import { ElementBase, defineElement } from '../../adapter'
import type { TElementClassOf, TElementType } from '../../adapter'
import { alertDialogTemplate } from './alert-dialog.template'
import { setupAlertDialog } from './setup.component'

export const TAlertDialogElement: TElementClassOf<
	typeof HTMLDivElement,
	typeof AlertDialogDescriptor,
	IAlertDialog
> = ElementBase(HTMLDivElement, {
	descriptor: AlertDialogDescriptor,
	template: alertDialogTemplate,
	root: { strategy: 'host', teleport: { target: 'target' } },
	setup: setupAlertDialog,
})

defineElement('so-alert-dialog', TAlertDialogElement, 'div')

export type TAlertDialogElementProps = TElementType<typeof TAlertDialogElement>

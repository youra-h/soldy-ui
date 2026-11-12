import type { TClosedComponent } from '../../adapter'
import AlertDialogComponent from './AlertDialog.vue'

export { default as BaseAlertDialog, emitsAlertDialog, propsAlertDialog } from './base.component'

export const AlertDialog: TClosedComponent<typeof AlertDialogComponent> = AlertDialogComponent

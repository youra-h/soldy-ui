import type { IAlertDialog } from '@soxa-ui/core'
import type { AlertDialogDescriptor } from '@soxa-ui/setup'
import type { EventProps, UseDomProps } from '../../types'

export type AlertDialogEventProps = EventProps<typeof AlertDialogDescriptor>

/** Consumer attributes belong to the panel; its sibling backdrop has no instance. */
export type AlertDialogProps = UseDomProps<
	typeof AlertDialogDescriptor,
	IAlertDialog,
	AlertDialogEventProps
>

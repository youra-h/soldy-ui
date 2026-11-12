import type { IAlertDialog } from '@soxa-ui/core'
import type { AlertDialogDescriptor } from '@soxa-ui/setup'
import type { EventProps, UseDomProps } from '../../types'

export type AlertDialogEventProps = EventProps<typeof AlertDialogDescriptor>

/** Атрибуты — панели: подложка — её сосед без экземпляра. */
export type AlertDialogProps = UseDomProps<
	typeof AlertDialogDescriptor,
	IAlertDialog,
	AlertDialogEventProps
>

import type { IAlertDialog } from '@soxa-ui/core'
import type { AlertDialogDescriptor } from '@soxa-ui/setup'
import type { EventProps, UseDomProps } from '../../types'

export type AlertDialogEventProps = EventProps<typeof AlertDialogDescriptor>

/** Пропсы AlertDialog: атрибуты — панели, у подложки их нет. */
export type AlertDialogProps = UseDomProps<
	typeof AlertDialogDescriptor,
	IAlertDialog,
	AlertDialogEventProps
>

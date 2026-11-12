import type { IAlertDialog } from '@soxa-ui/core'
import type { AlertDialogDescriptor } from '@soxa-ui/setup'
import type { EventProps, UseDomProps } from '../../types'

/** События AlertDialog (ядро и плагины). */
export type AlertDialogEventProps = EventProps<typeof AlertDialogDescriptor>

/** Пропсы AlertDialog. Атрибуты — панели; слот `title` вычитает из атрибутов одноимённый атрибут. */
export type AlertDialogProps = UseDomProps<
	typeof AlertDialogDescriptor,
	IAlertDialog,
	AlertDialogEventProps
>

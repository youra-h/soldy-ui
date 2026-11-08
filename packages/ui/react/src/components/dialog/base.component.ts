import type { IDialog } from '@soxa-ui/core'
import type { DialogDescriptor } from '@soxa-ui/setup'
import type { EventProps, UseDomProps } from '../../types'

export type DialogEventProps = EventProps<typeof DialogDescriptor>

/** Пропсы Dialog: атрибуты — панели, у подложки их нет. */
export type DialogProps = UseDomProps<typeof DialogDescriptor, IDialog, DialogEventProps>

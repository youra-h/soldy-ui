import type { IDialog } from '@soxa-ui/core'
import type { DialogDescriptor } from '@soxa-ui/setup'
import type { EventProps, UseDomProps } from '../../types'

export type DialogEventProps = EventProps<typeof DialogDescriptor>

/** Атрибуты — панели: подложка — её сосед без экземпляра. */
export type DialogProps = UseDomProps<typeof DialogDescriptor, IDialog, DialogEventProps>

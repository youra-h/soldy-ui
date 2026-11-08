import type { IPopover } from '@soxa-ui/core'
import type { PopoverDescriptor } from '@soxa-ui/setup'
import type { EventProps, UseDomProps } from '../../types'

export type PopoverEventProps = EventProps<typeof PopoverDescriptor>

/** Атрибуты — обёртке триггера, а не панели. */
export type PopoverProps = UseDomProps<typeof PopoverDescriptor, IPopover, PopoverEventProps>

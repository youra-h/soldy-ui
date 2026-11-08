import type { IPopover } from '@soxa-ui/core'
import type { PopoverDescriptor } from '@soxa-ui/setup'
import type { EventProps, UseDomProps } from '../../types'

/** События Popover (ядро и плагины). */
export type PopoverEventProps = EventProps<typeof PopoverDescriptor>

/** Пропсы Popover. Атрибуты — корня, обёртки триггера: ARIA поповера — у панели. */
export type PopoverProps = UseDomProps<typeof PopoverDescriptor, IPopover, PopoverEventProps>

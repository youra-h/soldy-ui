import type { ITooltip } from '@soxa-ui/core'
import type { TooltipDescriptor } from '@soxa-ui/setup'
import type { EventProps, UseDomProps } from '../../types'

export type TooltipEventProps = EventProps<typeof TooltipDescriptor>

/** Пропсы Tooltip: атрибуты — корню, обёртке триггера. */
export type TooltipProps = UseDomProps<typeof TooltipDescriptor, ITooltip, TooltipEventProps>

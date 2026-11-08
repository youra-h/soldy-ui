import type { IScroller } from '@soxa-ui/core'
import type { ScrollerDescriptor } from '@soxa-ui/setup'
import type { EventProps, UseDomProps } from '../../types'

export type ScrollerEventProps = EventProps<typeof ScrollerDescriptor>

/** Атрибуты — корню; роль ряда вьюпорт получает пропом `viewportAria`. */
export type ScrollerProps = UseDomProps<typeof ScrollerDescriptor, IScroller, ScrollerEventProps>

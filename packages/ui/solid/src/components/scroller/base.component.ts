import type { IScroller } from '@soxa-ui/core'
import type { ScrollerDescriptor } from '@soxa-ui/setup'
import type { EventProps, UseDomProps } from '../../types'

/** События слоя Scroller (core + плагины), выведены из дескриптора автоматически. */
export type ScrollerEventProps = EventProps<typeof ScrollerDescriptor>

/** Атрибуты потребителя — корню; вьюпорт получает свой набор `viewportAria`. */
export type ScrollerProps = UseDomProps<typeof ScrollerDescriptor, IScroller, ScrollerEventProps>

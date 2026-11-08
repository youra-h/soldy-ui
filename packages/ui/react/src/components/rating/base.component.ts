import type { IRating } from '@soxa-ui/core'
import type { RatingDescriptor } from '@soxa-ui/setup'
import type { EventProps, UseDomProps } from '../../types'

export type RatingEventProps = EventProps<typeof RatingDescriptor>

/** Пропсы Rating: атрибуты — корню целиком, указатель поле не ловит. */
export type RatingProps = UseDomProps<typeof RatingDescriptor, IRating, RatingEventProps>

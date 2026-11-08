import type { ISkeleton } from '@soxa-ui/core'
import type { SkeletonDescriptor } from '@soxa-ui/setup'
import type { EventProps, UseDomProps } from '../../types'

export type SkeletonEventProps = EventProps<typeof SkeletonDescriptor>

export type SkeletonProps = UseDomProps<typeof SkeletonDescriptor, ISkeleton, SkeletonEventProps>

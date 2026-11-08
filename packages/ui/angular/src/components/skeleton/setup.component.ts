import { SkeletonDescriptor } from '@soxa-ui/setup'
import type { ISkeleton } from '@soxa-ui/core'
import { createAngularAdapterContext, useAdapter } from '../../adapter'
import type { TBinding } from '../../adapter'

export function setupSkeleton(ctrl: ISkeleton | undefined, props: object): TBinding<ISkeleton> {
	const adapter = createAngularAdapterContext(SkeletonDescriptor(), { ctrl, props })

	return useAdapter(adapter)
}

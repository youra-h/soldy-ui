import { SkeletonDescriptor } from '@soxa-ui/setup'
import { useComponent } from '../../adapter'
import type { SkeletonProps } from './base.component'

export function useSetupSkeleton(props: SkeletonProps) {
	return useComponent(
		(create) => create(SkeletonDescriptor(), { ctrl: props.ctrl, props }),
		props,
	)
}

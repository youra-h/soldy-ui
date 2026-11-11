import type { ElementType, ReactElement } from 'react'
import { renderSlot, toRootProps } from '../../../adapter'
import { useSetupAvatarGroup } from './setup.component'
import type { AvatarGroupProps } from './base.component'

export function AvatarGroup(props: AvatarGroupProps): ReactElement | null {
	const { ref, forwardProps, state } = useSetupAvatarGroup(props)
	if (!state.rendered) return null
	const Tag = state.tag as ElementType
	return (
		<Tag {...toRootProps(ref, state, [state.attrs, state.aria, state.dataset], forwardProps)}>
			{renderSlot(props.children)}
			{state.displayOverflow && (
				<span className="so-avatar-group__overflow">
					{renderSlot(props['overflow-content'], { count: state.overflow ?? 0 }) ?? (
						<span className="so-avatar-group__count">{state.displayOverflow}</span>
					)}
				</span>
			)}
		</Tag>
	)
}

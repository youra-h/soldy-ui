import type { ElementType, ReactElement } from 'react'
import { renderSlot, toRootProps } from '../../adapter'
import { useSetupAvatar } from './setup.component'
import type { AvatarProps } from './base.component'

export function Avatar(props: AvatarProps): ReactElement | null {
	const { ref, forwardProps, state } = useSetupAvatar(props)
	if (!state.rendered) return null
	const Tag = state.tag as ElementType
	return (
		<Tag {...toRootProps(ref, state, [state.attrs, state.aria, state.dataset], forwardProps)}>
			{state.status === 'loaded' ? (
				<img className="so-avatar__image" src={state.src || undefined} alt="" />
			) : (
				<span className="so-avatar__fallback" aria-hidden="true">
					{renderSlot(props.fallback) ?? state.initials}
				</span>
			)}
		</Tag>
	)
}

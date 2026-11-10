import type { ElementType, ReactElement } from 'react'
import { renderSlot, toRootProps, toAriaProps } from '../../adapter'
import { useSetupBadge } from './setup.component'
import type { BadgeProps } from './base.component'

export function Badge(props: BadgeProps): ReactElement | null {
	const { ref, forwardProps, state } = useSetupBadge(props)
	const { rendered, tag, displayValue, aria, dataset, attrs } = state

	if (!rendered) return null

	const Tag = tag as ElementType

	return (
		<Tag {...toRootProps(ref, state, [attrs, dataset], forwardProps)}>
			<span className="so-badge__anchor">{renderSlot(props.anchor)}</span>
			<span className="so-badge__indicator" {...toAriaProps(aria)}>
				{displayValue}
			</span>
		</Tag>
	)
}

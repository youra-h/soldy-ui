import type { ElementType, ReactElement } from 'react'
import { Elevate, hasSlot, relaySlot, renderSlot, toRootProps } from '../../adapter'
import { BreadcrumbsItem } from './item'
import { useSetupBreadcrumbs } from './setup.component'
import type { BreadcrumbsProps } from './base.component'

export function Breadcrumbs(props: BreadcrumbsProps): ReactElement | null {
	const { ref, forwardProps, state, layer } = useSetupBreadcrumbs(props)

	if (!state.rendered) return null

	const Tag = state.tag as ElementType

	return (
		<Tag {...toRootProps(ref, state, [state.attrs, state.aria, state.dataset], forwardProps)}>
			<Elevate layer={layer}>
				<ol className="so-breadcrumbs__list">
					{hasSlot(props.children)
						? renderSlot(props.children)
						: state.shown?.map((item) => (
								<BreadcrumbsItem
									key={item.uid}
									ctrl={item}
									leading={renderSlot(props['item-leading'], { item })}
									trailing={renderSlot(props['item-trailing'], { item })}
								>
									{relaySlot(props.item, { item })}
								</BreadcrumbsItem>
							))}
				</ol>
			</Elevate>
		</Tag>
	)
}

import type { ElementType, ReactElement } from 'react'
import { Elevate, hasSlot, relaySlot, renderSlot, toRootProps } from '../../adapter'
import { ToggleGroupItem } from './item'
import { useSetupToggleGroup } from './setup.component'
import type { ToggleGroupProps } from './base.component'

export function ToggleGroup(props: ToggleGroupProps): ReactElement | null {
	const { ref, forwardProps, state, layer } = useSetupToggleGroup(props)

	const { rendered, tag, shown, attrs, aria, dataset } = state

	if (!rendered) return null

	const Tag = tag as ElementType

	return (
		<Tag {...toRootProps(ref, state, [attrs, aria, dataset], forwardProps)}>
			<Elevate layer={layer}>
				{hasSlot(props.children)
					? renderSlot(props.children)
					: shown?.map((item) => (
							<ToggleGroupItem
								leading={renderSlot(props['item-leading'], { item })}
								trailing={renderSlot(props['item-trailing'], { item })}
								key={item.uid}
								ctrl={item}
							>
								{relaySlot(props.item, { item })}
							</ToggleGroupItem>
						))}
			</Elevate>
		</Tag>
	)
}

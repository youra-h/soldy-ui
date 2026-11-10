import type { ElementType, ReactElement } from 'react'
import { renderSlot, toRootProps } from '../../../adapter'
import { useSetupToggleGroupItem } from './setup.component'
import type { ToggleGroupItemProps } from './base.component'

export function ToggleGroupItem(props: ToggleGroupItemProps): ReactElement | null {
	return renderToggleGroupItem(useSetupToggleGroupItem(props), props)
}

export type TToggleGroupItemBinding = Pick<
	ReturnType<typeof useSetupToggleGroupItem>,
	'ref' | 'forwardProps' | 'state'
>

export function renderToggleGroupItem(
	{ ref, forwardProps, state }: TToggleGroupItemBinding,
	props: ToggleGroupItemProps,
): ReactElement | null {
	const { rendered, tag, text, aria, dataset, attrs } = state

	if (!rendered) return null

	const Tag = tag as ElementType

	return (
		<Tag {...toRootProps(ref, state, [attrs, aria, dataset], forwardProps)}>
			{renderSlot(props.leading)}
			<span className="so-button__text">
				{renderSlot(props.children, {
					text: text ?? '',
					selected: state.selected ?? false,
				}) ?? text}
			</span>
			{renderSlot(props.trailing)}
		</Tag>
	)
}

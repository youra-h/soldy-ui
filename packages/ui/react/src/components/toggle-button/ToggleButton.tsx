import type { ElementType, ReactElement } from 'react'
import { renderSlot, toRootProps } from '../../adapter'
import { useSetupToggleButton } from './setup.component'
import type { ToggleButtonProps } from './base.component'

export function ToggleButton(props: ToggleButtonProps): ReactElement | null {
	return renderToggleButton(useSetupToggleButton(props), props)
}

export type TToggleButtonBinding = Pick<
	ReturnType<typeof useSetupToggleButton>,
	'ref' | 'forwardProps' | 'state'
>

export function renderToggleButton(
	{ ref, forwardProps, state }: TToggleButtonBinding,
	props: ToggleButtonProps,
): ReactElement | null {
	const { rendered, tag, text, aria, dataset, attrs } = state

	if (!rendered) return null

	const Tag = tag as ElementType

	return (
		<Tag {...toRootProps(ref, state, [attrs, aria, dataset], forwardProps)}>
			{renderSlot(props.leading)}
			<span className="so-button__text">
				{renderSlot(props.children, { text: text ?? '' }) ?? text}
			</span>
			{renderSlot(props.trailing)}
		</Tag>
	)
}

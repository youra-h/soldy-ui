import type { ElementType, ReactElement, NamedExoticComponent } from 'react'
import {
	renderSlot,
	toAriaProps,
	toControlAttrs,
	toRootForward,
	toRootProps,
	useClickAction,
	withRenderBoundary,
} from '../../../adapter'
import { ItemRow } from '../../item-row'
import { useSetupBreadcrumbsOverflowItem } from './setup.component'
import type {
	BreadcrumbsOverflowItemAttributes,
	BreadcrumbsOverflowItemProps,
} from './base.component'

export const BreadcrumbsOverflowItem: NamedExoticComponent<BreadcrumbsOverflowItemProps> =
	withRenderBoundary(function BreadcrumbsOverflowItem(
		props: BreadcrumbsOverflowItemProps,
	): ReactElement | null {
		const { ref, forwardProps, state, context } = useSetupBreadcrumbsOverflowItem(props)
		const choose = useClickAction((event) => {
			if (!event.defaultPrevented) context?.adapters.menu.choose()
		})

		const { rendered, tag, text, size, disabled, aria, dataset, attrs } = state

		if (!rendered) return null

		const Tag = tag as ElementType
		const row = toControlAttrs<BreadcrumbsOverflowItemAttributes>(forwardProps)

		return (
			<Tag {...toRootProps(ref, state, [dataset, attrs], toRootForward(forwardProps))}>
				<ItemRow
					embedded="menu.row"
					tag="a"
					size={size}
					disabled={disabled}
					{...toAriaProps(aria)}
					{...row}
					ref={choose}
					leading={
						<span className="so-menu-item__icon">{renderSlot(props.leading)}</span>
					}
					trailing={
						<span className="so-menu-item__shortcut">{renderSlot(props.trailing)}</span>
					}
				>
					{renderSlot(props.children, { text: text ?? '' }) ?? text}
				</ItemRow>
			</Tag>
		)
	})

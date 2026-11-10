import type { ElementType, ReactElement } from 'react'
import {
	renderSlot,
	toAriaProps,
	toControlAttrs,
	toRootForward,
	toRootProps,
	withRenderBoundary,
} from '../../../adapter'
import { ItemRow } from '../../item-row'
import { Button } from '../../button'
import { Menu } from '../../menu'
import { BreadcrumbsOverflowItem } from '../OverflowItem'
import { useSetupBreadcrumbsItem } from './setup.component'
import type { BreadcrumbsItemAttributes, BreadcrumbsItemProps } from './base.component'
export const BreadcrumbsItem = withRenderBoundary(function BreadcrumbsItem(
	props: BreadcrumbsItemProps,
): ReactElement | null {
	const { ref, forwardProps, state } = useSetupBreadcrumbsItem(props)
	if (!state.rendered) return null
	const Tag = state.tag as ElementType
	const row = {
		...toAriaProps(state.attrs),
		...toAriaProps(state.aria),
		...toControlAttrs<BreadcrumbsItemAttributes>(forwardProps),
	}
	const content =
		renderSlot(props.children, { text: state.text ?? '', active: state.active ?? false }) ??
		state.text
	return (
		<Tag
			{...toRootProps(
				ref,
				{ ...state, visible: state.visible && state.breadcrumbs_shown },
				[state.dataset],
				toRootForward(forwardProps),
			)}
		>
			{state.breadcrumbs_separator ? (
				<span className="so-breadcrumbs__separator" aria-hidden="true" />
			) : null}
			<ItemRow
				embedded="breadcrumbs.row"
				tag="a"
				className="so-breadcrumbs__link"
				size={state.size}
				variant={state.variant}
				disabled={state.disabled}
				{...row}
				leading={renderSlot(props.leading)}
				trailing={renderSlot(props.trailing)}
			>
				{content}
			</ItemRow>
			{state.breadcrumbs_menu ? (
				<>
					<span className="so-breadcrumbs__separator" aria-hidden="true" />
					<Menu
						embedded="breadcrumbs.menu"
						key={state.breadcrumbs_menu.uid}
						ctrl={state.breadcrumbs_menu}
						className="so-breadcrumbs__overflow"
						trigger={({ triggerAria, triggerDataset }) => (
							<Button
								embedded="breadcrumbs.trigger"
								type="button"
								className="so-breadcrumbs__trigger"
								size={state.size}
								{...toAriaProps(triggerAria)}
								{...triggerDataset}
								{...toAriaProps(state.breadcrumbs_overflowAria)}
							>
								&#8230;
							</Button>
						)}
					>
						{state.breadcrumbs_overflowEntries?.map((entry) => (
							<BreadcrumbsOverflowItem
								key={entry.item.uid}
								ctrl={entry.menuItem}
								{...entry.item.attrs.toObject()}
							>
								{entry.item.text}
							</BreadcrumbsOverflowItem>
						))}
					</Menu>
				</>
			) : null}
		</Tag>
	)
})

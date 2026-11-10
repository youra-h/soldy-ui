import type { ElementType, ReactElement } from 'react'
import type { TBreadcrumbsEntry } from '@soxa-ui/core'
import { renderSlot, toAriaProps, toRootProps } from '../../adapter'
import { Menu } from '../menu'
import { Button } from '../button'
import { BreadcrumbsOverflowItem } from './OverflowItem'
import { useSetupBreadcrumbs } from './setup.component'
import type { BreadcrumbsProps } from './base.component'
export function Breadcrumbs(props: BreadcrumbsProps): ReactElement | null {
	const { ref, forwardProps, state, menu } = useSetupBreadcrumbs(props)
	if (!state.rendered) return null
	const Tag = state.tag as ElementType
	const entries = state.entries ?? [],
		hiddenEntries = state.hiddenEntries ?? []
	const content = (entry: TBreadcrumbsEntry) => (
		<>
			{renderSlot(props['item-leading'], entry)}
			{renderSlot(props.item, entry) ?? entry.item.text}
			{renderSlot(props['item-trailing'], entry)}
		</>
	)
	return (
		<Tag {...toRootProps(ref, state, [state.attrs, state.aria, state.dataset], forwardProps)}>
			<ol className="so-breadcrumbs__list">
				{entries.flatMap((entry, position) => [
					position === 1 && hiddenEntries.length > 0 ? (
						<li className="so-breadcrumbs__item" key="overflow">
							<span className="so-breadcrumbs__separator" aria-hidden="true" />
							<Menu
								embedded="breadcrumbs.menu"
								key={menu?.uid}
								ctrl={menu}
								size={state.size}
								variant={state.variant}
								className="so-breadcrumbs__overflow"
								trigger={({ triggerAria, triggerDataset }) => (
									<Button
										embedded="breadcrumbs.trigger"
										type="button"
										className="so-breadcrumbs__trigger"
										size={state.size}
										{...toAriaProps(triggerAria)}
										{...triggerDataset}
										{...toAriaProps(state.overflowAria)}
									>
										…
									</Button>
								)}
							>
								{hiddenEntries.map((hidden) => (
									<BreadcrumbsOverflowItem
										key={hidden.index}
										text={hidden.item.text}
										disabled={hidden.item.href === undefined}
										{...hidden.attrs}
										data-breadcrumb-index={hidden.index}
										leading={renderSlot(props['item-leading'], hidden)}
										trailing={renderSlot(props['item-trailing'], hidden)}
									>
										{renderSlot(props.item, hidden) ?? hidden.item.text}
									</BreadcrumbsOverflowItem>
								))}
							</Menu>
						</li>
					) : null,
					<li className="so-breadcrumbs__item" key={entry.index}>
						{position > 0 ? (
							<span className="so-breadcrumbs__separator" aria-hidden="true" />
						) : null}
						{entry.item.href === undefined ? (
							<span
								className="so-breadcrumbs__link"
								{...entry.aria}
								{...entry.dataset}
							>
								{content(entry)}
							</span>
						) : (
							<a
								className="so-breadcrumbs__link"
								{...entry.attrs}
								{...entry.aria}
								{...entry.dataset}
							>
								{content(entry)}
							</a>
						)}
					</li>,
				])}
			</ol>
		</Tag>
	)
}

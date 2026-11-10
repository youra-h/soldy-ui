import type { JSX } from 'solid-js'
import { Dynamic } from 'solid-js/web'
import type { TBreadcrumbsEntry } from '@soxa-ui/core'
import { Root, createRootProps, createPartProps, renderSlot, liveScope } from '../../adapter'
import { Show, For } from '../../adapter/runtime/flow'
import { Menu } from '../menu'
import { Button } from '../button'
import { BreadcrumbsOverflowItem } from './OverflowItem'
import { setupBreadcrumbs } from './setup.component'
import type { BreadcrumbsProps } from './base.component'

function Location(props: { entry: TBreadcrumbsEntry; slots: BreadcrumbsProps }): JSX.Element {
	const attributes = createPartProps(() => ({
		...props.entry.attrs,
		...props.entry.aria,
		...props.entry.dataset,
	}))
	const scope = liveScope(() => props.entry)

	return (
		<Dynamic
			component={props.entry.item.href === undefined ? 'span' : 'a'}
			class="so-breadcrumbs__link"
			{...attributes()}
		>
			{renderSlot(props.slots['item-leading'], scope)}
			{renderSlot(props.slots.item, scope) ?? props.entry.item.text}
			{renderSlot(props.slots['item-trailing'], scope)}
		</Dynamic>
	)
}
export function Breadcrumbs(props: BreadcrumbsProps): JSX.Element {
	const binding = setupBreadcrumbs(props),
		state = binding.state
	const root = createRootProps(() => ({
		state,
		sets: [state.attrs, state.aria, state.dataset],
		forward: binding.forwardProps(),
	}))

	return (
		<Show when={state.rendered}>
			<Root tag={state.tag} attributes={root} ref={binding.ref}>
				<ol class="so-breadcrumbs__list">
					<For each={state.entries}>
						{(entry, position) => (
							<>
								<Show
									when={
										position() === 1 && (state.hiddenEntries?.length ?? 0) > 0
									}
								>
									<li class="so-breadcrumbs__item">
										<span
											class="so-breadcrumbs__separator"
											aria-hidden="true"
										/>
										<Menu
											embedded="breadcrumbs.menu"
											ctrl={binding.menu}
											size={state.size}
											variant={state.variant}
											class="so-breadcrumbs__overflow"
											trigger={({ triggerAria, triggerDataset }) => (
												<Button
													embedded="breadcrumbs.trigger"
													type="button"
													class="so-breadcrumbs__trigger"
													size={state.size}
													{...triggerAria}
													{...triggerDataset}
													{...state.overflowAria}
												>
													…
												</Button>
											)}
										>
											<For each={state.hiddenEntries}>
												{(hidden) => (
													<BreadcrumbsOverflowItem
														text={hidden.item.text}
														disabled={hidden.item.href === undefined}
														{...hidden.attrs}
														data-breadcrumb-index={hidden.index}
														leading={renderSlot(
															props['item-leading'],
															hidden,
														)}
														trailing={renderSlot(
															props['item-trailing'],
															hidden,
														)}
													>
														{renderSlot(props.item, hidden) ??
															hidden.item.text}
													</BreadcrumbsOverflowItem>
												)}
											</For>
										</Menu>
									</li>
								</Show>
								<li class="so-breadcrumbs__item">
									<Show when={position() > 0}>
										<span
											class="so-breadcrumbs__separator"
											aria-hidden="true"
										/>
									</Show>
									<Location entry={entry} slots={props} />
								</li>
							</>
						)}
					</For>
				</ol>
			</Root>
		</Show>
	)
}

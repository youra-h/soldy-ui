import type { JSX } from 'solid-js'
import {
	type TRootState,
	Root,
	createRootProps,
	renderSlot,
	resolveSlot,
	toControlAttrs,
	toRootForward,
} from '../../../adapter'
import { For, Show } from '../../../adapter/runtime/flow'
import { ItemRow } from '../../item-row'
import { Button } from '../../button'
import { Menu } from '../../menu'
import { BreadcrumbsOverflowItem } from '../overflow-item'
import { setupBreadcrumbsItem } from './setup.component'
import type { BreadcrumbsItemAttributes, BreadcrumbsItemProps } from './base.component'

export function BreadcrumbsItem(props: BreadcrumbsItemProps): JSX.Element {
	const binding = setupBreadcrumbsItem(props),
		state = binding.state

	// State fields are proxy-backed; list root fields explicitly when overriding only visibility.
	const rootState: TRootState = state
	const root = createRootProps(() => ({
		state: {
			classes: state.classes,
			layout_styles: rootState.layout_styles,
			order: state.order,
			visible: state.visible && state.breadcrumbs_shown,
		},
		sets: [state.dataset],
		forward: toRootForward(binding.forwardProps()),
	}))

	const row = () => ({
		...state.attrs,
		...state.aria,
		...toControlAttrs<BreadcrumbsItemAttributes>(binding.forwardProps()),
	})

	const content = resolveSlot(
		() => props.children,
		() => ({ text: state.text ?? '', active: state.active ?? false }),
	)

	return (
		<Show when={state.rendered}>
			<Root tag={state.tag} attributes={root} ref={binding.ref}>
				<Show when={state.breadcrumbs_separator}>
					<span class="so-breadcrumbs__separator" aria-hidden="true" />
				</Show>
				<ItemRow
					embedded="breadcrumbs.row"
					tag="a"
					class="so-breadcrumbs__link"
					size={state.size}
					variant={state.variant}
					disabled={state.disabled}
					{...row()}
					leading={renderSlot(props.leading)}
					trailing={renderSlot(props.trailing)}
				>
					{content() ?? state.text}
				</ItemRow>
				<Show when={state.breadcrumbs_menu} keyed>
					{(menu) => (
						<>
							<span class="so-breadcrumbs__separator" aria-hidden="true" />
							<Menu
								embedded="breadcrumbs.menu"
								ctrl={menu}
								class="so-breadcrumbs__overflow"
								trigger={({ triggerAria, triggerDataset }) => (
									<Button
										embedded="breadcrumbs.trigger"
										type="button"
										class="so-breadcrumbs__trigger"
										size={state.size}
										{...triggerAria}
										{...triggerDataset}
										{...state.breadcrumbs_overflowAria}
									>
										&#8230;
									</Button>
								)}
							>
								<For each={state.breadcrumbs_overflowEntries}>
									{(entry) => (
										<BreadcrumbsOverflowItem
											ctrl={entry.menuItem}
											{...entry.item.attrs.toObject()}
										>
											{entry.item.text}
										</BreadcrumbsOverflowItem>
									)}
								</For>
							</Menu>
						</>
					)}
				</Show>
			</Root>
		</Show>
	)
}

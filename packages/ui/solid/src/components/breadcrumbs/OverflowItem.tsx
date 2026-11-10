import type { JSX } from 'solid-js'
import {
	Root,
	clickAction,
	createRootProps,
	renderSlot,
	resolveSlot,
	toControlAttrs,
	toRootForward,
} from '../../adapter'
import { Show } from '../../adapter/runtime/flow'
import { ItemRow } from '../item-row'
import { setupMenuItem } from '../menu/item/setup.component'
import type { MenuItemAttributes, MenuItemProps } from '../menu/item/base.component'

export function BreadcrumbsOverflowItem(
	props: MenuItemProps & { href?: string; target?: string; rel?: string },
): JSX.Element {
	const binding = setupMenuItem(props)
	const state = binding.state
	const context = binding.context
	const root = createRootProps(() => ({
		state,
		sets: [state.dataset, state.attrs],
		forward: toRootForward(binding.forwardProps()),
	}))
	const content = resolveSlot(
		() => props.children,
		() => ({ text: state.text ?? '' }),
	)

	const row = () => toControlAttrs<MenuItemAttributes>(binding.forwardProps())
	const choose = clickAction((event) => {
		if (!event.defaultPrevented) context?.adapters.menu.choose()
	})

	return (
		<Show when={state.rendered}>
			<Root tag={state.tag} attributes={root} ref={binding.ref}>
				<ItemRow
					embedded="menu.row"
					tag="a"
					size={state.size}
					disabled={state.disabled}
					{...state.aria}
					{...row()}
					ref={choose}
					leading={<span class="so-menu-item__icon">{renderSlot(props.leading)}</span>}
					trailing={
						<span class="so-menu-item__shortcut">{renderSlot(props.trailing)}</span>
					}
				>
					{content() ?? state.text}
				</ItemRow>
			</Root>
		</Show>
	)
}

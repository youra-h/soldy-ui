<script lang="ts">
	import { clickAction, Dynamic, toControlAttrs, toRootForward, toRootProps } from '../../adapter'
	import { ItemRow } from '../item-row'
	import { setupMenuItem } from '../menu/item/setup.component'
	import type { MenuItemAttributes, MenuItemProps } from '../menu/item/base.component'

	type BreadcrumbsOverflowItemProps = MenuItemProps & { href?: string; target?: string; rel?: string }
	let { ref = $bindable(), ...props }: BreadcrumbsOverflowItemProps = $props()
	const mountId = $props.id()

	const binding = setupMenuItem(() => props, mountId, (node) => (ref = node))
	const state = binding.state
	const context = binding.context
	const choose = clickAction((event) => {
		if (!event.defaultPrevented) context?.adapters.menu.choose()
	})
</script>

<Dynamic
	rendered={state.rendered}
	tag={state.tag}
	attributes={toRootProps(
		state,
		[state.dataset, state.attrs],
		toRootForward(binding.forwardProps),
	)}
	attach={binding.attachElement}
>
	<ItemRow
		embedded="menu.row"
		tag="a"
		size={state.size}
		disabled={state.disabled}
		{...state.aria}
		{...toControlAttrs<MenuItemAttributes>(binding.forwardProps)}
		{@attach choose}
	>
		{#snippet leading()}
			<span class="so-menu-item__icon">{@render props.leading?.()}</span>
		{/snippet}
		{#if props.children}
			{@render props.children({ text: state.text ?? '' })}
		{:else}
			{state.text}
		{/if}
		{#snippet trailing()}
			<span class="so-menu-item__shortcut">{@render props.trailing?.()}</span>
		{/snippet}
	</ItemRow>
</Dynamic>

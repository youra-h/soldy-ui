<script lang="ts">
	import { Dynamic, toControlAttrs, toRootForward, toRootProps } from '../../../adapter'
	import { ItemRow } from '../../item-row'
	import { Button } from '../../button'
	import { Menu } from '../../menu'
	import { BreadcrumbsOverflowItem } from '../overflow-item'
	import { setupBreadcrumbsItem } from './setup.component'
	import type { BreadcrumbsItemAttributes, BreadcrumbsItemProps } from './base.component'

	let { ref = $bindable(), ...props }: BreadcrumbsItemProps = $props()
	const mountId = $props.id()

	const binding = setupBreadcrumbsItem(() => props, mountId, (node) => (ref = node))
	const state = binding.state
</script>

{#snippet content()}
	{#if props.children}
		{@render props.children({ text: state.text ?? '', active: state.active ?? false })}
	{:else}
		{state.text}
	{/if}
{/snippet}

<Dynamic
	rendered={state.rendered}
	tag={state.tag}
	attributes={toRootProps(
		{ ...state, visible: state.visible && state.breadcrumbs_shown },
		[state.dataset],
		toRootForward(binding.forwardProps),
	)}
	attach={binding.attachElement}
>
	{#if state.breadcrumbs_separator}
		<span class="so-breadcrumbs__separator" aria-hidden="true"></span>
	{/if}<ItemRow
		embedded="breadcrumbs.row"
		tag="a"
		class="so-breadcrumbs__link"
		size={state.size}
		variant={state.variant}
		disabled={state.disabled}
		{...state.attrs}
		{...state.aria}
		{...toControlAttrs<BreadcrumbsItemAttributes>(binding.forwardProps)}
		leading={props.leading}
		trailing={props.trailing}
		children={content}
	/>{#if state.breadcrumbs_menu}
		<span class="so-breadcrumbs__separator" aria-hidden="true"></span><Menu
			embedded="breadcrumbs.menu"
			ctrl={state.breadcrumbs_menu}
			class="so-breadcrumbs__overflow"
		>
			{#snippet trigger({ triggerAria, triggerDataset })}
				<Button
					embedded="breadcrumbs.trigger"
					type="button"
					class="so-breadcrumbs__trigger"
					size={state.size}
					{...triggerAria}
					{...triggerDataset}
					{...state.breadcrumbs_overflowAria}
				>&#8230;</Button>
			{/snippet}
			{#each state.breadcrumbs_overflowEntries ?? [] as entry (entry.item.uid)}
				<BreadcrumbsOverflowItem ctrl={entry.menuItem} {...entry.item.attrs.toObject()}>
					{entry.item.text}
				</BreadcrumbsOverflowItem>
			{/each}
		</Menu>
	{/if}
</Dynamic>

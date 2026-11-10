<script lang="ts">
	import { Dynamic, toRootProps } from '../../adapter'
	import { ToggleGroupItem } from './item'
	import { setupToggleGroup } from './setup.component'
	import type { ToggleGroupProps } from './base.component'

	let { ref = $bindable(), ...props }: ToggleGroupProps = $props()
	const mountId = $props.id()

	const binding = setupToggleGroup(() => props, mountId, (node) => (ref = node))
	const state = binding.state
</script>

<Dynamic
	rendered={state.rendered}
	tag={state.tag}
	attributes={toRootProps(
		state,
		[state.attrs, state.aria, state.dataset],
		binding.forwardProps,
	)}
	attach={binding.attachElement}
>
	{#if props.children}
		{@render props.children()}
	{:else}
		{#each state.shown ?? [] as item (item.uid)}
			{#snippet label(scope: { text: string; selected: boolean })}
				{@render props.item?.({ ...scope, item: item })}
			{/snippet}
			{#snippet leading()}{@render props['item-leading']?.({ item })}{/snippet}
			{#snippet trailing()}{@render props['item-trailing']?.({ item })}{/snippet}
			<ToggleGroupItem ctrl={item} children={props.item ? label : undefined} leading={props['item-leading'] ? leading : undefined} trailing={props['item-trailing'] ? trailing : undefined} />
		{/each}
	{/if}
</Dynamic>

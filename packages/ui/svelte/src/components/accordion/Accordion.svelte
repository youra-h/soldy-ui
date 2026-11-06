<script lang="ts">
	import { Dynamic, toRootProps } from '../../adapter'
	import { AccordionItem } from './item'
	import { setupAccordion } from './setup.component'
	import type { AccordionProps } from './base.component'

	let { ref = $bindable(), ...props }: AccordionProps = $props()
	const mountId = $props.id()

	const binding = setupAccordion(() => props, mountId, (node) => (ref = node))
	const state = binding.state
</script>

<Dynamic
	rendered={state.rendered}
	tag="div"
	attributes={toRootProps(state, [state.attrs], binding.forwardProps)}
	attach={binding.attachElement}
>
	{#if props.children}
		{@render props.children()}
	{:else}
		{#each state.shown ?? [] as section (section.uid)}
			{#snippet arrowIcon()}
				{@render props['item-arrow-icon']?.({ item: section })}
			{/snippet}
			{#snippet leading()}{@render props['item-leading']?.({ item: section })}{/snippet}
			{#snippet header(scope: { text: string; selected: boolean })}
				{@render props.item?.({ ...scope, item: section })}
			{/snippet}
			{#snippet trailing()}{@render props['item-trailing']?.({ item: section })}{/snippet}
			{#snippet content()}{@render props['item-content']?.({ item: section })}{/snippet}
			<AccordionItem
				ctrl={section}
				arrow-icon={props['item-arrow-icon'] ? arrowIcon : undefined}
				leading={props['item-leading'] ? leading : undefined}
				header={props.item ? header : undefined}
				trailing={props['item-trailing'] ? trailing : undefined}
				children={props['item-content'] ? content : undefined}
			/>
		{/each}
	{/if}
</Dynamic>

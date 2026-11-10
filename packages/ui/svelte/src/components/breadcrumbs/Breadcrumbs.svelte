<script lang="ts">
	import { Dynamic, toRootProps } from '../../adapter'
	import { BreadcrumbsItem } from './item'
	import { setupBreadcrumbs } from './setup.component'
	import type { BreadcrumbsProps } from './base.component'

	let { ref = $bindable(), ...props }: BreadcrumbsProps = $props()
	const mountId = $props.id()

	const binding = setupBreadcrumbs(() => props, mountId, (node) => (ref = node))
	const state = binding.state
</script>

<Dynamic
	rendered={state.rendered}
	tag={state.tag}
	attributes={toRootProps(state, [state.attrs, state.aria, state.dataset], binding.forwardProps)}
	attach={binding.attachElement}
>
	<ol class="so-breadcrumbs__list">
		{#if props.children}
			{@render props.children()}
		{:else}
			{#each state.shown ?? [] as item (item.uid)}
				{#snippet leading()}{@render props['item-leading']?.({ item })}{/snippet}
				{#snippet trailing()}{@render props['item-trailing']?.({ item })}{/snippet}
				{#snippet content(scope: { text: string; active: boolean })}
					{@render props.item?.({ ...scope, item })}
				{/snippet}
				<BreadcrumbsItem
					ctrl={item}
					leading={props['item-leading'] ? leading : undefined}
					trailing={props['item-trailing'] ? trailing : undefined}
					children={props.item ? content : undefined}
				/>
			{/each}
		{/if}
	</ol>
</Dynamic>

<script lang="ts">
	import { Dynamic, toRootProps } from '../../adapter'
	import { Menu } from '../menu'
	import { Button } from '../button'
	import BreadcrumbsOverflowItem from './OverflowItem.svelte'
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
	attributes={toRootProps(
		state,
		[state.attrs, state.aria, state.dataset],
		binding.forwardProps,
	)}
	attach={binding.attachElement}
>
	<ol class="so-breadcrumbs__list">
		{#each state.entries ?? [] as entry, position (entry.index)}
			{#if position === 1 && state.hiddenEntries?.length}
				<li class="so-breadcrumbs__item">
					<span class="so-breadcrumbs__separator" aria-hidden="true"></span><Menu
						embedded="breadcrumbs.menu"
						ctrl={binding.menu}
						size={state.size}
						variant={state.variant}
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
								{...state.overflowAria}
							>{#snippet children()}…{/snippet}</Button>
						{/snippet}
						{#snippet children()}
							{#each state.hiddenEntries ?? [] as hidden (hidden.index)}
								<BreadcrumbsOverflowItem
									text={hidden.item.text}
									disabled={hidden.item.href === undefined}
									{...hidden.attrs}
									data-breadcrumb-index={hidden.index}
								>
									{#snippet leading()}
										{@render props['item-leading']?.(hidden)}
									{/snippet}
									{#snippet children()}
										{#if props.item}{@render props.item(hidden)}{:else}{hidden.item.text}{/if}
									{/snippet}
									{#snippet trailing()}
										{@render props['item-trailing']?.(hidden)}
									{/snippet}
								</BreadcrumbsOverflowItem>
							{/each}
						{/snippet}
					</Menu>
				</li>
			{/if}
			<li class="so-breadcrumbs__item">
				{#if position > 0}<span class="so-breadcrumbs__separator" aria-hidden="true"></span>{/if}<svelte:element
					this={entry.item.href === undefined ? 'span' : 'a'}
					class="so-breadcrumbs__link"
					{...entry.attrs}
					{...entry.aria}
					{...entry.dataset}
				>
					{@render props['item-leading']?.(entry)}{#if props.item}{@render props.item(entry)}{:else}{entry.item.text}{/if}{@render props['item-trailing']?.(entry)}
				</svelte:element>
			</li>
		{/each}
	</ol>
</Dynamic>

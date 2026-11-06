<script lang="ts">
	/**
	 * Test harness for an accordion built from data. The arrow snippet renders
	 * content for one section at a time. A snippet with a hyphenated slot name
	 * must be passed as an attribute in Svelte.
	 */
	import type { IAccordionItem } from '@soldy-ui/core'
	import { Accordion } from '@soldy-ui/svelte'

	type THarnessProps = {
		case: 'first' | 'second'
	}

	const props: THarnessProps = $props()

	const ITEMS = [
		{ value: 'a', text: 'Первый' },
		{ value: 'b', text: 'Второй' },
	]
</script>

{#snippet leadingIcon({ item }: { item: IAccordionItem })}
	{#if item.value === 'a'}<b class="probe">›</b>{/if}
{/snippet}

{#snippet trailingIcon({ item }: { item: IAccordionItem })}
	{#if item.value === 'b'}<b class="probe">›</b>{/if}
{/snippet}

{#if props.case === 'first'}
	<Accordion items={ITEMS} item-arrow-icon={leadingIcon} />
{:else}
	<Accordion items={ITEMS} item-arrow-icon={trailingIcon} />
{/if}

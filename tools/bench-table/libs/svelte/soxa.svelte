<script lang="ts" module>
	export { sel } from '../soxa-setup'
</script>

<script lang="ts">
	import { Table, Virtual } from '@soxa-ui/svelte'
	import type { TRec } from '../data'
	import { columns, tableProps, virtual, width } from '../soxa-setup'

	/** Таблица soxa на адаптере Svelte — те же колонки, флаги и обёртки, что у Vue. */
	const { rows }: { rows: TRec[] } = $props()
	const items = $derived(rows.map((data) => ({ data })))
</script>

{#snippet table()}
	<Table {items} {columns} {...tableProps} />
{/snippet}

{#snippet body()}
	{#if virtual}
		<div class="bench-scroll" style="height: 800px; overflow: auto">
			<Virtual>{@render table()}</Virtual>
		</div>
	{:else}
		{@render table()}
	{/if}
{/snippet}

{#if width}
	<div style="width: {width}px">{@render body()}</div>
{:else}
	{@render body()}
{/if}

<script lang="ts">
	import { AlertDialog, Button, LocaleProvider } from '@soxa-ui/svelte'
	import type { AlertDialogProps } from '@soxa-ui/svelte'
	import { ruRU } from '@soxa-ui/plugins'

	let { dialog = {}, count }: { dialog?: AlertDialogProps; count?: number } = $props()
</script>

<LocaleProvider locale={ruRU}>
	{#if count === undefined}
		<AlertDialog {...dialog}>
			{#snippet title()}Delete?{/snippet}
			Cannot undo
			{#snippet action()}Delete{/snippet}
		</AlertDialog>
	{:else}
		<AlertDialog {...dialog}>
			{#snippet title()}Delete?{/snippet}
			{#snippet footer({ confirm })}
				{#each Array(count) as _, i}
					<Button onclick={confirm}>{i}</Button>
				{/each}
			{/snippet}
		</AlertDialog>
	{/if}
</LocaleProvider>

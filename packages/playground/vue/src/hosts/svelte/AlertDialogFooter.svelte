<script lang="ts">
	import { AlertDialog } from '@soxa-ui/svelte'
	import type { TPreviewProps } from './previews'

	const bind: TPreviewProps = $props()
</script>

<AlertDialog {...bind}>
	{#snippet title()}Custom question{/snippet}
	Custom description
	{#snippet footer()}<button type="button" data-audit-footer>Custom footer</button>{/snippet}
</AlertDialog>

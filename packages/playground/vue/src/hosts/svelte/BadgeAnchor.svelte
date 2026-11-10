<script lang="ts">
	import { Badge, Button } from '@soxa-ui/svelte'
	import type { TPreviewProps } from './previews'
	const bind: TPreviewProps = $props()
</script>
<Badge {...bind}>
	{#snippet anchor()}<Button onclick={() => document.dispatchEvent(new Event('badge-anchor-click'))}>Inbox</Button>{/snippet}
</Badge>

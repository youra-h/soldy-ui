<script lang="ts">
	import { Badge } from '@soxa-ui/svelte'
</script>
<Badge value={120} aria_label="120 unread">
	{#snippet anchor()}<button>Inbox</button>{/snippet}
</Badge>

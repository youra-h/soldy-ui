<script lang="ts">
	import { Alert } from '@soxa-ui/svelte'
</script>

<Alert closable role="status">
	{#snippet title()}Notice{/snippet}
	Content
</Alert>

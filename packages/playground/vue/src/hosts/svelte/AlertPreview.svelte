<script lang="ts">
	import { Alert, Button, Icon, roleIcon } from '@soxa-ui/svelte'
	import { ALERT_SAMPLE } from '@soxa-ui/playground-shared'
	import type { TPreviewProps } from './previews'
	const bind: TPreviewProps = $props()
	const warningIcon = roleIcon('warning')
</script>

<Alert {...bind}>
	{#snippet icon()}<Icon tag={warningIcon} />{/snippet}
	{#snippet title()}{ALERT_SAMPLE.title}{/snippet}
	{ALERT_SAMPLE.message}
	{#snippet action()}<Button type="button">{ALERT_SAMPLE.action}</Button>{/snippet}
</Alert>

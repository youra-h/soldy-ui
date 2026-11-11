<script lang="ts">
	import { Avatar, Icon, roleIcon } from '@soxa-ui/svelte'
	import type { TPreviewProps } from './previews'

	const bind: TPreviewProps = $props()
	const CHECK = roleIcon('check')
</script>

<Avatar {...bind}>
	{#snippet fallback()}<Icon tag={CHECK} />{/snippet}
</Avatar>

<script lang="ts">
	import { ToggleButton } from '@soxa-ui/svelte'
	import type { TPreviewProps } from './previews'
	const bind: TPreviewProps = $props()
</script>

<ToggleButton {...bind} />

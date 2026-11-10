<script lang="ts">
	import { ToggleGroup } from '@soxa-ui/svelte'
	import type { TPreviewProps } from './previews'
	const bind: TPreviewProps = $props()
</script>

<ToggleGroup {...bind} />

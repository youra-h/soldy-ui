<script lang="ts">
	import { COLLECTION_ITEMS } from '@soxa-ui/playground-shared'
	import { ToggleGroup } from '@soxa-ui/svelte'
	import type { TPreviewProps } from './previews'
	const bind: TPreviewProps = $props()
</script>

<ToggleGroup items={COLLECTION_ITEMS} {...bind} />

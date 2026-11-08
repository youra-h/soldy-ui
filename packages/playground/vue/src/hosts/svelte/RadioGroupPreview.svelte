<script lang="ts">
	import { COLLECTION_ITEMS } from '@soxa-ui/playground-shared'
	import { RadioGroup } from '@soxa-ui/svelte'
	import type { TPreviewProps } from './previews'
	import { getParts } from './events'

	const bind: TPreviewProps = $props()
	const parts = getParts()
</script>

<!-- The label is the content: a radio has no text, it is a bare control, like CheckBox -->
<RadioGroup {...bind}>
	{#each COLLECTION_ITEMS as item (item.value)}
		<RadioGroup.Item value={item.value} {...parts.Item}>{item.text}</RadioGroup.Item>
	{/each}
</RadioGroup>

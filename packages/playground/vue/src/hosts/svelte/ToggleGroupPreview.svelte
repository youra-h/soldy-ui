<script lang="ts">
	import { EDITOR_ALIGNMENT_ITEMS, editorAlignmentPath } from '@soxa-ui/playground-shared'
	import type { IToggleGroupItem } from '@soxa-ui/core'
	import { ToggleGroup } from '@soxa-ui/svelte'
	import type { TPreviewProps } from './previews'

	const bind: TPreviewProps = $props()
</script>

{#snippet leading({ item }: { item: IToggleGroupItem })}
	<svg
		width="16"
		height="16"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width="1.5"
		stroke-linecap="round"
		aria-hidden="true"
	>
		<path d={editorAlignmentPath(item.text)} />
	</svg>
{/snippet}

<ToggleGroup items={EDITOR_ALIGNMENT_ITEMS} {...bind} item-leading={leading} />

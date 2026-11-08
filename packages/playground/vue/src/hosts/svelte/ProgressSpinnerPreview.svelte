<script lang="ts">
	import { ProgressSpinner } from '@soxa-ui/svelte'
	import type { TPreviewProps } from './previews'

	const bind: TPreviewProps = $props()
</script>

<!--
	Кольцо строчное и своего размера. По умолчанию оно пусто — доля ноль, а бег
	— флаг `indeterminate`.
-->
<ProgressSpinner {...bind} />

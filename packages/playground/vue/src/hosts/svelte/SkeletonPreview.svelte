<script lang="ts">
	import { Skeleton } from '@soxa-ui/svelte'
	import type { TPreviewProps } from './previews'

	const bind: TPreviewProps = $props()
</script>

<Skeleton {...bind} />

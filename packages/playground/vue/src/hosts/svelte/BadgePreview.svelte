<script lang="ts">
	import { Badge } from '@soxa-ui/svelte'
	import type { TPreviewProps } from './previews'

	const bind: TPreviewProps = $props()
</script>

<Badge {...bind} />

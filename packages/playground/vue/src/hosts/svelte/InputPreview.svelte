<script lang="ts">
	import { Input } from '@soxa-ui/svelte'
	import type { TPreviewProps } from './previews'

	const bind: TPreviewProps = $props()
</script>

<Input {...bind} />

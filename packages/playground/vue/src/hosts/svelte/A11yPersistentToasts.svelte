<script lang="ts">
	import { Toasts } from '@soxa-ui/svelte'
	import type { TPreviewProps } from './previews'

	const bind: TPreviewProps = $props()
</script>

<Toasts {...bind} />

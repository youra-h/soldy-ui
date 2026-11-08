<script lang="ts">
	import { NumberInput } from '@soxa-ui/svelte'
	import type { TPreviewProps } from './previews'

	const bind: TPreviewProps = $props()
</script>

<NumberInput {...bind} />

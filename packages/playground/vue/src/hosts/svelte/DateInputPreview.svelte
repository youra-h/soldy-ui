<script lang="ts">
	import { DateInput } from '@soxa-ui/svelte'
	import type { TPreviewProps } from './previews'

	const bind: TPreviewProps = $props()
</script>

<!-- Язык — из шапки стенда, как у календаря -->
<DateInput {...bind} />

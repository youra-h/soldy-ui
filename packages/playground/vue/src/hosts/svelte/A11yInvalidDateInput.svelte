<script lang="ts">
	import { Field, DateInput } from '@soxa-ui/svelte'
	import type { TPreviewProps } from './previews'

	const bind: TPreviewProps = $props()
</script>

<Field label="Account" invalid error="Enter a valid email"><DateInput {...bind} /></Field>

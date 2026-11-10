<script lang="ts">
	import { Field, Input } from '@soxa-ui/svelte'
	import type { TPreviewProps } from './previews'

	const bind: TPreviewProps = $props()
</script>

<Field label="Account" invalid error="Enter a valid email"><Input {...bind} /></Field>

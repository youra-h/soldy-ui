<script lang="ts">
	import { Field, Textarea } from '@soxa-ui/svelte'
	import type { TPreviewProps } from './previews'

	const bind: TPreviewProps = $props()
</script>

<Field label="Account" invalid error="Enter a valid email"><Textarea {...bind} /></Field>

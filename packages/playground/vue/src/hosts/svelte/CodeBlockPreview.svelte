<script lang="ts">
 import { CodeBlock } from '@soxa-ui/svelte'
 import type { TPreviewProps } from './previews'
 const bind:TPreviewProps=$props()
</script>
<CodeBlock {...bind}/>

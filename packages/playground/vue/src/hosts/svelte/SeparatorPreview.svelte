<script lang="ts">
 import { Separator } from '@soxa-ui/svelte'
 import type { TPreviewProps } from './previews'
 const bind: TPreviewProps = $props()
</script>
<div style="width:100%;height:120px;display:flex;align-items:center"><Separator {...bind} /></div>

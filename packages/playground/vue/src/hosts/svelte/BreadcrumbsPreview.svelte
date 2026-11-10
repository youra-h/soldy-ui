<script lang="ts">
	import { BREADCRUMBS_ITEMS } from '@soxa-ui/playground-shared'
	import { Breadcrumbs } from '@soxa-ui/svelte'
	import type { TPreviewProps } from './previews'

	const bind: TPreviewProps = $props()
</script>

<Breadcrumbs items={BREADCRUMBS_ITEMS} {...bind} />

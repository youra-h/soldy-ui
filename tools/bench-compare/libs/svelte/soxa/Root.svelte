<script lang="ts">
	import type { Snippet } from 'svelte'
	import { enUS } from '@soxa-ui/plugins'
	import { LocaleProvider } from '@soxa-ui/svelte'

	const { children }: { children: Snippet } = $props()
</script>

<LocaleProvider locale={enUS}>{@render children()}</LocaleProvider>

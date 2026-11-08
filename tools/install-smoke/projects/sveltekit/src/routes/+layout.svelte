<script module lang="ts">
	import { useIcons, useTheme } from '@soxa-ui/setup'
	import * as material from '@soxa-ui/icons-material'
	import oren from '@soxa-ui/theme-oren/setup'

	import '@soxa-ui/theme-oren'

	// The registries are global: filled once per process, on the server too,
	// not once per request
	useIcons(material)
	useTheme(oren)
</script>

<script lang="ts">
	import type { LayoutProps } from './$types'

	let { children }: LayoutProps = $props()
</script>

{@render children()}

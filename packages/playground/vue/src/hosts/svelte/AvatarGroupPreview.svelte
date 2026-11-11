<script lang="ts">
	import { Avatar, AvatarGroup } from '@soxa-ui/svelte'
	import { AVATAR_PEOPLE } from '@soxa-ui/playground-shared'
	import type { TPreviewProps } from './previews'

	const bind: TPreviewProps = $props()
</script>

<AvatarGroup {...bind}>
	{#each AVATAR_PEOPLE as person (person.initials)}<Avatar {...person} />{/each}
</AvatarGroup>

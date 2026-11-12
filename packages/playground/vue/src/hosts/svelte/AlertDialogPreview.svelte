<script lang="ts">
	import type { TValuePayload } from '@soxa-ui/core'
	import { Button, AlertDialog } from '@soxa-ui/svelte'
	import type { TPreviewProps } from './previews'

	const bind: TPreviewProps = $props()


	const row = $derived(bind.visible === true)
	let shown = $derived(row)

	function setShown(value: boolean): void {
		shown = value
	}


	function onChangeVisible(payload: TValuePayload<boolean>): void {
		setShown(payload.newValue)

		const listener = bind.onChangeVisible

		if (typeof listener === 'function') listener(payload)
	}
</script>

<Button text="Открыть окно" onclick={() => setShown(true)} />
<AlertDialog {...bind} visible={shown} {onChangeVisible}>
	{#snippet title()}Удалить запись?{/snippet}
	<p>Удалённую запись нельзя будет восстановить.</p>
	{#snippet action()}Удалить{/snippet}
</AlertDialog>

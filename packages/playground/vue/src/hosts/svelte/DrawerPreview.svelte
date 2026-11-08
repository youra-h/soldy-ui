<script lang="ts">
	import type { TValuePayload } from '@soxa-ui/core'
	import { Button, Drawer, Input } from '@soxa-ui/svelte'
	import type { TPreviewProps } from './previews'

	const bind: TPreviewProps = $props()

	/**
	 * Выезжающую панель на стенде тоже открывает кнопка — по той же причине,
	 * что окно, и на том же своём состоянии (см. `DialogPreview.svelte`).
	 */
	const row = $derived(bind.visible === true)
	let shown = $derived(row)

	function setShown(value: boolean): void {
		shown = value
	}

	/** Своё состояние, затем обработчик страницы (журнал событий): он не затирается. */
	function onChangeVisible(payload: TValuePayload<boolean>): void {
		setShown(payload.newValue)

		const listener = bind.onChangeVisible

		if (typeof listener === 'function') listener(payload)
	}
</script>

<!--
	Кнопка и панель лежат в своей коробке с `position: relative`: с
	`contained` панель не телепортируется, а встаёт в ближайшем
	позиционированном предке, и строка `contained` показывает её в коробке
	превью, а не у края всей страницы.
-->
<div style="position: relative; width: 100%; min-height: 240px; overflow: hidden">
	<Button text="Открыть панель" onclick={() => setShown(true)} />
	<Drawer {...bind} visible={shown} {onChangeVisible}>
		{#snippet title()}Фильтры{/snippet}
		<p style="margin: 0 0 8px">Произвольное содержимое: текст, поля, кнопки</p>
		<Input placeholder="Поиск" />
		{#snippet footer()}
			<Button text="Сбросить" onclick={() => setShown(false)} />
			<Button text="Применить" onclick={() => setShown(false)} />
		{/snippet}
	</Drawer>
</div>

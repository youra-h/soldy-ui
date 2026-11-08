<script lang="ts">
	import { Field, Input } from '@soxa-ui/svelte'
	import type { TPreviewProps } from './previews'

	const bind: TPreviewProps = $props()
</script>

<!--
	Поле формы вокруг Input: тексты частей — пропсы превью, контрол —
	содержимым. Строки страницы правят само поле: сторону подписи, тексты,
	ошибку.
-->
<Field {...bind}>
	<Input placeholder="name@example.com" />
</Field>

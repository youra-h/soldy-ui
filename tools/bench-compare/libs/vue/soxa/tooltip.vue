<script setup lang="ts">
import { Button, Tooltip } from '@soxa-ui/vue'

defineOptions({ name: 'SoxaTooltipPage' })
</script>

<template>
	<Tooltip>
		<template #trigger="{ triggerAria }">
			<Button text="Наведи" v-bind="triggerAria" />
		</template>
		Короткое пояснение к кнопке
	</Tooltip>
</template>

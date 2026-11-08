<script lang="ts">
	import type { DescriptorSlots, TooltipDescriptor } from '@soxa-ui/setup'
	import { Button, Tooltip } from '@soxa-ui/svelte'

	type TTriggerScope = DescriptorSlots<typeof TooltipDescriptor>['trigger']
</script>

<Tooltip>
	{#snippet trigger({ triggerAria }: TTriggerScope)}
		<Button text="Наведи" {...triggerAria} />
	{/snippet}
	Короткое пояснение к кнопке
</Tooltip>

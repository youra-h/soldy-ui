import { Button, Tooltip } from '@soxa-ui/solid'

export default function Page() {
	return (
		<Tooltip trigger={(scope) => <Button text="Наведи" {...scope.triggerAria} />}>
			Короткое пояснение к кнопке
		</Tooltip>
	)
}

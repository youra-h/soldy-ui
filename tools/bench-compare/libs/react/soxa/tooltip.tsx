import { Button, Tooltip } from '@soxa-ui/react'

export default function Page() {
	return (
		<Tooltip trigger={({ triggerAria }) => <Button text="Наведи" {...triggerAria} />}>
			Короткое пояснение к кнопке
		</Tooltip>
	)
}

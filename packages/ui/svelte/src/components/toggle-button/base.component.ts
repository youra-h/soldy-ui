import type { HTMLButtonAttributes } from 'svelte/elements'
import type { IToggleButton } from '@soxa-ui/core'
import type { ToggleButtonDescriptor } from '@soxa-ui/setup'
import type { EventProps, UseDomProps } from '../../types'

export type ToggleButtonEventProps = EventProps<typeof ToggleButtonDescriptor>

export type ToggleButtonProps = UseDomProps<
	typeof ToggleButtonDescriptor,
	IToggleButton,
	ToggleButtonEventProps,
	HTMLButtonAttributes
>

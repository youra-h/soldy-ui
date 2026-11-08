import type { IMenuRadioGroup } from '@soxa-ui/core'
import type { MenuRadioGroupDescriptor } from '@soxa-ui/setup'
import type { EventProps, UseDomProps } from '../../../types'

export type MenuRadioGroupEventProps = EventProps<typeof MenuRadioGroupDescriptor>

export type MenuRadioGroupProps = UseDomProps<
	typeof MenuRadioGroupDescriptor,
	IMenuRadioGroup,
	MenuRadioGroupEventProps
>

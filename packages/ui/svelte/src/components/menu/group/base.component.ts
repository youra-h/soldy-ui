import type { IItemGroup } from '@soxa-ui/core'
import type { MenuGroupDescriptor } from '@soxa-ui/setup'
import type { EventProps, UseDomProps } from '../../../types'

export type MenuGroupEventProps = EventProps<typeof MenuGroupDescriptor>

export type MenuGroupProps = UseDomProps<
	typeof MenuGroupDescriptor,
	IItemGroup,
	MenuGroupEventProps
>

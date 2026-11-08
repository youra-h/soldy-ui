import type { IItemGroup } from '@soxa-ui/core'
import type { SelectGroupDescriptor } from '@soxa-ui/setup'
import type { EventProps, UseDomProps } from '../../../types'

export type SelectGroupEventProps = EventProps<typeof SelectGroupDescriptor>

export type SelectGroupProps = UseDomProps<
	typeof SelectGroupDescriptor,
	IItemGroup,
	SelectGroupEventProps
>

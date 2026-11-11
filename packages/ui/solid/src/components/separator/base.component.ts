import type { ISeparator } from '@soxa-ui/core'
import type { SeparatorDescriptor } from '@soxa-ui/setup'
import type { EventProps, UseDomProps } from '../../types'

export type SeparatorEventProps = EventProps<typeof SeparatorDescriptor>

export type SeparatorProps = UseDomProps<
	typeof SeparatorDescriptor,
	ISeparator,
	SeparatorEventProps
>

import type { TMenuSeparator } from '@soxa-ui/core'
import type { MenuSeparatorDescriptor } from '@soxa-ui/setup'
import type { EventProps, UseDomProps } from '../../../types'

export type MenuSeparatorEventProps = EventProps<typeof MenuSeparatorDescriptor>

export type MenuSeparatorProps = UseDomProps<
	typeof MenuSeparatorDescriptor,
	TMenuSeparator,
	MenuSeparatorEventProps
>

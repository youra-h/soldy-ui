import type { IComponentView } from '@soxa-ui/core'
import type { ComponentViewDescriptor } from '@soxa-ui/setup'
import type { EventProps, UseDomProps } from '../../types'

export type ComponentViewEventProps = EventProps<typeof ComponentViewDescriptor>

export type ComponentViewProps = UseDomProps<
	typeof ComponentViewDescriptor,
	IComponentView,
	ComponentViewEventProps
>

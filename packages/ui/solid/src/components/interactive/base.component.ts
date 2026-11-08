import type { IInteractive } from '@soxa-ui/core'
import type { InteractiveDescriptor } from '@soxa-ui/setup'
import type { EventProps, UseProps } from '../../types'

/** События слоя Interactive (core + плагины), выведены из дескриптора автоматически. */
export type InteractiveEventProps = EventProps<typeof InteractiveDescriptor>

export type InteractiveProps = UseProps<
	typeof InteractiveDescriptor,
	IInteractive,
	InteractiveEventProps
>

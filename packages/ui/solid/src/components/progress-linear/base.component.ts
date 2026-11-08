import type { IProgressLinear } from '@soxa-ui/core'
import type { ProgressLinearDescriptor } from '@soxa-ui/setup'
import type { EventProps, UseDomProps } from '../../types'

/** События слоя ProgressLinear (core + плагины), выведены из дескриптора автоматически. */
export type ProgressLinearEventProps = EventProps<typeof ProgressLinearDescriptor>

export type ProgressLinearProps = UseDomProps<
	typeof ProgressLinearDescriptor,
	IProgressLinear,
	ProgressLinearEventProps
>

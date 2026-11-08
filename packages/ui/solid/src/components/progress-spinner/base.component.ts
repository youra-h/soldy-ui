import type { IProgressSpinner } from '@soxa-ui/core'
import type { ProgressSpinnerDescriptor } from '@soxa-ui/setup'
import type { EventProps, UseDomProps } from '../../types'

/** События слоя ProgressSpinner (core + плагины), выведены из дескриптора автоматически. */
export type ProgressSpinnerEventProps = EventProps<typeof ProgressSpinnerDescriptor>

export type ProgressSpinnerProps = UseDomProps<
	typeof ProgressSpinnerDescriptor,
	IProgressSpinner,
	ProgressSpinnerEventProps
>

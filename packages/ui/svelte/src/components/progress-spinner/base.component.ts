import type { IProgressSpinner } from '@soxa-ui/core'
import type { ProgressSpinnerDescriptor } from '@soxa-ui/setup'
import type { EventProps, UseDomProps } from '../../types'

export type ProgressSpinnerEventProps = EventProps<typeof ProgressSpinnerDescriptor>

export type ProgressSpinnerProps = UseDomProps<
	typeof ProgressSpinnerDescriptor,
	IProgressSpinner,
	ProgressSpinnerEventProps
>

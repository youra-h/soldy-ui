import { useEmits, useProps } from '../../adapter'
import type { TEmits, TProps, UseProps } from '../../types/common'
import { TooltipDescriptor } from '@soxa-ui/setup'
import type { ITooltip } from '@soxa-ui/core'

export const emitsTooltip: TEmits = useEmits(TooltipDescriptor())

export const propsTooltip: TProps = useProps(TooltipDescriptor()) as TProps

export type TooltipProps = UseProps<typeof TooltipDescriptor, ITooltip>

export default {
	name: 'BaseTooltip',
	emits: emitsTooltip,
	props: propsTooltip,
}

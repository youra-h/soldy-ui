import { useEmits, useProps } from '../../adapter'
import type { TEmits, TProps, UseProps } from '../../types/common'
import { SwitchDescriptor } from '@soxa-ui/setup'
import type { ISwitch } from '@soxa-ui/core'

export const emitsSwitch: TEmits = useEmits(SwitchDescriptor())

export const propsSwitch: TProps = useProps(SwitchDescriptor()) as TProps

export type SwitchProps = UseProps<typeof SwitchDescriptor, ISwitch>

export default {
	name: 'BaseSwitch',
	emits: emitsSwitch,
	props: propsSwitch,
}

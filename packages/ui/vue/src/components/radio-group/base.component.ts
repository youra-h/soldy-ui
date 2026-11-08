import { useEmits, useProps } from '../../adapter'
import type { TEmits, TProps, UseProps } from '../../types/common'
import { RadioGroupDescriptor, RadioGroupCollectionDescriptor } from '@soxa-ui/setup'
import type { IRadioGroup } from '@soxa-ui/core'

export const emitsRadioGroup: TEmits = [
	...useEmits(RadioGroupDescriptor()),
	...useEmits(RadioGroupCollectionDescriptor()),
]

export const propsRadioGroup: TProps = {
	...(useProps(RadioGroupDescriptor()) as TProps),
	...(useProps(RadioGroupCollectionDescriptor()) as TProps),
}

export type RadioGroupProps = UseProps<typeof RadioGroupDescriptor, IRadioGroup>

export default {
	name: 'BaseRadioGroup',
	emits: emitsRadioGroup,
	props: propsRadioGroup,
}

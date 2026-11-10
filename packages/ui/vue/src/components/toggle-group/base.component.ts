import { useEmits, useProps } from '../../adapter'
import type { TEmits, TProps, UseProps } from '../../types/common'
import { ToggleGroupDescriptor, ToggleGroupCollectionDescriptor } from '@soxa-ui/setup'
import type { IToggleGroup } from '@soxa-ui/core'

export const emitsToggleGroup: TEmits = [
	...useEmits(ToggleGroupDescriptor()),
	...useEmits(ToggleGroupCollectionDescriptor()),
]

export const propsToggleGroup: TProps = {
	...(useProps(ToggleGroupDescriptor()) as TProps),
	...(useProps(ToggleGroupCollectionDescriptor()) as TProps),
}

export type ToggleGroupProps = UseProps<typeof ToggleGroupDescriptor, IToggleGroup>

export default {
	name: 'BaseToggleGroup',
	emits: emitsToggleGroup,
	props: propsToggleGroup,
}

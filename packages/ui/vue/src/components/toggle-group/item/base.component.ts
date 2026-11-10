import { useEmits, useProps } from '../../../adapter'
import type { TEmits, TProps, UseProps } from '../../../types/common'
import { ToggleGroupItemDescriptor, ToggleGroupCollectionItemDescriptor } from '@soxa-ui/setup'
import type { IToggleGroupItem } from '@soxa-ui/core'

export const emitsToggleGroupItem: TEmits = [
	...useEmits(ToggleGroupItemDescriptor()),
	...useEmits(ToggleGroupCollectionItemDescriptor()),
]

export const propsToggleGroupItem: TProps = {
	...(useProps(ToggleGroupItemDescriptor()) as TProps),
	...(useProps(ToggleGroupCollectionItemDescriptor()) as TProps),
}

export type ToggleGroupItemProps = UseProps<typeof ToggleGroupItemDescriptor, IToggleGroupItem>

export default {
	name: 'BaseToggleGroupItem',
	emits: emitsToggleGroupItem,
	props: propsToggleGroupItem,
}

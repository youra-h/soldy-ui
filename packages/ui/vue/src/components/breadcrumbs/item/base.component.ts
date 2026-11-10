import { useEmits, useProps } from '../../../adapter'
import type { TEmits, TProps, UseProps } from '../../../types/common'
import { BreadcrumbsItemDescriptor, BreadcrumbsCollectionItemDescriptor } from '@soxa-ui/setup'
import type { IBreadcrumbsItem } from '@soxa-ui/core'

export const emitsBreadcrumbsItem: TEmits = [
	...useEmits(BreadcrumbsItemDescriptor()),
	...useEmits(BreadcrumbsCollectionItemDescriptor()),
]
export const propsBreadcrumbsItem: TProps = {
	...(useProps(BreadcrumbsItemDescriptor()) as TProps),
	...(useProps(BreadcrumbsCollectionItemDescriptor()) as TProps),
}

export type BreadcrumbsItemProps = UseProps<typeof BreadcrumbsItemDescriptor, IBreadcrumbsItem>
export default {
	name: 'BaseBreadcrumbsItem',
	emits: emitsBreadcrumbsItem,
	props: propsBreadcrumbsItem,
}

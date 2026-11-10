import { useEmits, useProps } from '../../adapter'
import type { TEmits, TProps, UseProps } from '../../types/common'
import { BreadcrumbsDescriptor, BreadcrumbsCollectionDescriptor } from '@soxa-ui/setup'
import type { IBreadcrumbs } from '@soxa-ui/core'

export const emitsBreadcrumbs: TEmits = [
	...useEmits(BreadcrumbsDescriptor()),
	...useEmits(BreadcrumbsCollectionDescriptor()),
]
export const propsBreadcrumbs: TProps = {
	...(useProps(BreadcrumbsDescriptor()) as TProps),
	...(useProps(BreadcrumbsCollectionDescriptor()) as TProps),
}

export type BreadcrumbsProps = UseProps<typeof BreadcrumbsDescriptor, IBreadcrumbs>
export default { name: 'BaseBreadcrumbs', emits: emitsBreadcrumbs, props: propsBreadcrumbs }

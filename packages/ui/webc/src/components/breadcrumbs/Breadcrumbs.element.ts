import { BreadcrumbsDescriptor } from '@soxa-ui/setup'
import type { IBreadcrumbs } from '@soxa-ui/core'
import { ElementBase, defineElement, type TElementClassOf, type TElementType } from '../../adapter'
import { breadcrumbsTemplate } from './breadcrumbs.template'
import { setupBreadcrumbs } from './setup.component'

export const TBreadcrumbsElement: TElementClassOf<
	typeof HTMLElement,
	typeof BreadcrumbsDescriptor,
	IBreadcrumbs
> = ElementBase(HTMLElement, {
	descriptor: BreadcrumbsDescriptor,
	template: breadcrumbsTemplate,
	setup: setupBreadcrumbs,
})

defineElement('so-breadcrumbs', TBreadcrumbsElement, 'nav')
export type TBreadcrumbsElementProps = TElementType<typeof TBreadcrumbsElement>

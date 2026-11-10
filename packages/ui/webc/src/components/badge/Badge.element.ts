import { BadgeDescriptor } from '@soxa-ui/setup'
import type { IBadge } from '@soxa-ui/core'
import { ElementBase, defineElement } from '../../adapter'
import type { TElementClassOf, TElementType } from '../../adapter'
import { badgeTemplate } from './badge.template'
import { setupBadge } from './setup.component'

export const TBadgeElement: TElementClassOf<
	typeof HTMLSpanElement,
	typeof BadgeDescriptor,
	IBadge
> = ElementBase(HTMLSpanElement, {
	descriptor: BadgeDescriptor,
	template: badgeTemplate,
	root: { strategy: 'host', sets: ['attrs', 'dataset'] },
	setup: setupBadge,
})
defineElement('so-badge', TBadgeElement, 'span')
export type TBadgeElementProps = TElementType<typeof TBadgeElement>

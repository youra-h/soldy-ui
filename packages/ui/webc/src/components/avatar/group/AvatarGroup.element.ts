import { AvatarGroupDescriptor } from '@soxa-ui/setup'
import type { IAvatarGroup } from '@soxa-ui/core'
import { ElementBase, defineElement } from '../../../adapter'
import type { TElementClassOf, TElementType } from '../../../adapter'
import { avatarGroupTemplate } from './avatar-group.template'
import { setupAvatarGroup } from './setup.component'

export const TAvatarGroupElement: TElementClassOf<
	typeof HTMLSpanElement,
	typeof AvatarGroupDescriptor,
	IAvatarGroup
> = ElementBase(HTMLSpanElement, {
	descriptor: AvatarGroupDescriptor,
	template: avatarGroupTemplate,
	root: { strategy: 'host' },
	setup: setupAvatarGroup,
})
defineElement('so-avatar-group', TAvatarGroupElement, 'span')
export type TAvatarGroupElementProps = TElementType<typeof TAvatarGroupElement>

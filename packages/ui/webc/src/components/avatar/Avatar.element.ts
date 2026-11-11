import { AvatarDescriptor } from '@soxa-ui/setup'
import type { IAvatar } from '@soxa-ui/core'
import { ElementBase, defineElement } from '../../adapter'
import type { TElementClassOf, TElementType } from '../../adapter'
import { avatarTemplate } from './avatar.template'
import { setupAvatar } from './setup.component'

export const TAvatarElement: TElementClassOf<
	typeof HTMLSpanElement,
	typeof AvatarDescriptor,
	IAvatar
> = ElementBase(HTMLSpanElement, {
	descriptor: AvatarDescriptor,
	template: avatarTemplate,
	root: { strategy: 'host' },
	setup: setupAvatar,
})
defineElement('so-avatar', TAvatarElement, 'span')
export type TAvatarElementProps = TElementType<typeof TAvatarElement>

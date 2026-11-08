/**
 * `<div is="so-skeleton">` — заглушка поверх содержимого (слот `default`).
 * Видимость решает только, показана ли заглушка, поэтому корень база не прячет
 * (`hides: false`): `display: none` спрятал бы и содержимое.
 */

import { SkeletonDescriptor } from '@soxa-ui/setup'
import type { ISkeleton } from '@soxa-ui/core'
import { ElementBase, defineElement } from '../../adapter'
import type { TElementClassOf, TElementType } from '../../adapter'
import { skeletonTemplate } from './skeleton.template'
import { setupSkeleton } from './setup.component'

export const TSkeletonElement: TElementClassOf<
	typeof HTMLDivElement,
	typeof SkeletonDescriptor,
	ISkeleton
> = ElementBase(HTMLDivElement, {
	descriptor: SkeletonDescriptor,
	template: skeletonTemplate,
	root: { strategy: 'host', hides: false },
	setup: setupSkeleton,
})

defineElement('so-skeleton', TSkeletonElement, 'div')

export type TSkeletonElementProps = TElementType<typeof TSkeletonElement>

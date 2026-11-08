import type { IItemGroup } from '@soxa-ui/core'
import type { MenuGroupDescriptor } from '@soxa-ui/setup'
import type { EventProps, UseDomProps } from '../../../types'

/** События группы — свои (ядро и плагин имени): подпись и её набор. */
export type MenuGroupEventProps = EventProps<typeof MenuGroupDescriptor>

/** Пропсы группы меню: подпись — проп `label`, пункты — дети. */
export type MenuGroupProps = UseDomProps<
	typeof MenuGroupDescriptor,
	IItemGroup,
	MenuGroupEventProps
>

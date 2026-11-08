import type { IItemGroup } from '@soxa-ui/core'
import type { SelectGroupDescriptor } from '@soxa-ui/setup'
import type { EventProps, UseDomProps } from '../../../types'

/** События группы — свои (ядро и плагин имени): подпись и её набор. */
export type SelectGroupEventProps = EventProps<typeof SelectGroupDescriptor>

/** Пропсы группы: подпись — проп `label`, опции — дети. */
export type SelectGroupProps = UseDomProps<
	typeof SelectGroupDescriptor,
	IItemGroup,
	SelectGroupEventProps
>

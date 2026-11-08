import type { IDrawer } from '@soxa-ui/core'
import type { DrawerDescriptor } from '@soxa-ui/setup'
import type { EventProps, UseDomProps } from '../../types'

export type DrawerEventProps = EventProps<typeof DrawerDescriptor>

/** Пропсы Drawer: атрибуты — панели, у подложки их нет. */
export type DrawerProps = UseDomProps<typeof DrawerDescriptor, IDrawer, DrawerEventProps>

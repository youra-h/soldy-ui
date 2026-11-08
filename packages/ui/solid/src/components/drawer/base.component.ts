import type { IDrawer } from '@soxa-ui/core'
import type { DrawerDescriptor } from '@soxa-ui/setup'
import type { EventProps, UseDomProps } from '../../types'

/** События Drawer (ядро и плагины). */
export type DrawerEventProps = EventProps<typeof DrawerDescriptor>

/** Пропсы Drawer. Атрибуты — панели; слот `title` вычитает из атрибутов одноимённый атрибут. */
export type DrawerProps = UseDomProps<typeof DrawerDescriptor, IDrawer, DrawerEventProps>

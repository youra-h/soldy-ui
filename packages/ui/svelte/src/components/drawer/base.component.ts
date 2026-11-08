import type { IDrawer } from '@soxa-ui/core'
import type { DrawerDescriptor } from '@soxa-ui/setup'
import type { EventProps, UseDomProps } from '../../types'

export type DrawerEventProps = EventProps<typeof DrawerDescriptor>

/** Атрибуты — панели: подложка — её сосед без экземпляра. */
export type DrawerProps = UseDomProps<typeof DrawerDescriptor, IDrawer, DrawerEventProps>

import type { IMenu } from '@soxa-ui/core'
import type { MenuCollectionDescriptor, MenuDescriptor } from '@soxa-ui/setup'
import type { EventProps, UseDomProps } from '../../types'

/** Колбэки обоих контекстов меню — свой и фасада коллекции — пропсы одного компонента. */
export type MenuEventProps = EventProps<typeof MenuDescriptor> &
	EventProps<typeof MenuCollectionDescriptor>

export type MenuProps = UseDomProps<typeof MenuDescriptor, IMenu, MenuEventProps>

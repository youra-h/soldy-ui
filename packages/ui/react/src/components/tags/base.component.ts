import type { ITags } from '@soxa-ui/core'
import type { TagsCollectionDescriptor, TagsDescriptor } from '@soxa-ui/setup'
import type { EventProps, UseDomProps } from '../../types'

/** Колбэки обоих контекстов набора — свой и фасада коллекции — пропсы одного компонента. */
export type TagsEventProps = EventProps<typeof TagsDescriptor> &
	EventProps<typeof TagsCollectionDescriptor>

export type TagsProps = UseDomProps<typeof TagsDescriptor, ITags, TagsEventProps>

import { withParts } from '@soxa-ui/setup'
import { Tags as TagsComponent } from './Tags'
import { TagsItem } from './item'

export * from './base.component'
export * from './item'

export const Tags = withParts(TagsComponent, { Item: TagsItem })

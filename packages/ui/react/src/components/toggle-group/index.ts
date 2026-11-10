import { withParts } from '@soxa-ui/setup'
import { ToggleGroup as ToggleGroupComponent } from './ToggleGroup'
import { ToggleGroupItem } from './item'

export * from './base.component'
export * from './item'

export const ToggleGroup = withParts(ToggleGroupComponent, { Item: ToggleGroupItem })

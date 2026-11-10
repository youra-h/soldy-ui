import { withParts } from '@soxa-ui/setup'
import type { TClosedComponent } from '../../adapter'
import ToggleGroupComponent from './ToggleGroup.vue'
import { ToggleGroupItem } from './item'

export { default as BaseToggleGroup } from './base.component'
export * from './base.component'
export * from './item'

const ToggleGroupOwner: TClosedComponent<typeof ToggleGroupComponent> = ToggleGroupComponent

export const ToggleGroup = withParts(ToggleGroupOwner, { Item: ToggleGroupItem })

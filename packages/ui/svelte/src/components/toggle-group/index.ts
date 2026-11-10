import { withParts } from '@soxa-ui/setup'
import ToggleGroupComponent from './ToggleGroup.svelte'
import { ToggleGroupItem } from './item'

export * from './base.component'
export { setupToggleGroup } from './setup.component'
export * from './item'

export const ToggleGroup = withParts(ToggleGroupComponent, { Item: ToggleGroupItem })

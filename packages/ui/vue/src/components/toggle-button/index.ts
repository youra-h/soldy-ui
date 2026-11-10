import type { TClosedComponent } from '../../adapter'
import ToggleButtonComponent from './ToggleButton.vue'

export { default as BaseToggleButton, emitsToggleButton, propsToggleButton } from './base.component'

export const ToggleButton: TClosedComponent<typeof ToggleButtonComponent> = ToggleButtonComponent

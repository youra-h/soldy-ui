import { ToggleButtonDescriptor } from '@soxa-ui/setup'
import type { IToggleButton } from '@soxa-ui/core'
import { ElementBase, defineElement } from '../../adapter'
import type { TElementClassOf, TElementOf } from '../../adapter'
import { toggleButtonTemplate } from './toggle-button.template'
import { setupToggleButton } from './setup.component'

export const TToggleButtonElement: TElementClassOf<
	typeof HTMLButtonElement,
	typeof ToggleButtonDescriptor,
	IToggleButton
> = ElementBase(HTMLButtonElement, {
	descriptor: ToggleButtonDescriptor,
	template: toggleButtonTemplate,
	setup: setupToggleButton,
})

defineElement('so-toggle-button', TToggleButtonElement, 'button')

export type TToggleButtonElementProps = TElementOf<
	HTMLButtonElement,
	typeof ToggleButtonDescriptor,
	IToggleButton
>

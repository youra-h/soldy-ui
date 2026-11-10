import { Component, ChangeDetectionStrategy } from '@angular/core'
import { NgTemplateOutlet } from '@angular/common'
import type { IToggleButton } from '@soxa-ui/core'
import { TToggleButtonSurface } from '../../generated/toggle-button.metadata'
import { setupToggleButton } from './setup.component'

@Component({
	selector: 'button[so-toggle-button], [so-toggle-button]',
	imports: [NgTemplateOutlet],
	changeDetection: ChangeDetectionStrategy.OnPush,
	templateUrl: './toggle-button.component.html',
})
export class TToggleButtonComponent extends TToggleButtonSurface<IToggleButton> {
	constructor() {
		super(setupToggleButton, { strategy: 'host', defaults: { type: 'button' } })
	}
}

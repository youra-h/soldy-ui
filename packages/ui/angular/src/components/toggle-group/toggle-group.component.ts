import { Component, ChangeDetectionStrategy } from '@angular/core'
import { NgTemplateOutlet } from '@angular/common'
import type { IToggleGroup } from '@soxa-ui/core'
import { SlotDirective, provideElevator } from '../../adapter'
import { TToggleGroupItemComponent } from './item'
import { TToggleGroupSurface } from '../../generated/toggle-group.metadata'
import { setupToggleGroup } from './setup.component'

@Component({
	selector: 'div[so-toggle-group], [so-toggle-group]',
	imports: [NgTemplateOutlet, SlotDirective, TToggleGroupItemComponent],
	providers: [provideElevator()],
	changeDetection: ChangeDetectionStrategy.OnPush,
	templateUrl: './toggle-group.component.html',
})
export class TToggleGroupComponent extends TToggleGroupSurface<IToggleGroup> {
	constructor() {
		super((ctrl, inputs) => setupToggleGroup(ctrl, inputs, this.engine), { strategy: 'host' })
	}
}

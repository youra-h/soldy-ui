import { Component, ChangeDetectionStrategy } from '@angular/core'
import { NgTemplateOutlet } from '@angular/common'
import type { IToggleGroupItem } from '@soxa-ui/core'
import { TToggleGroupItemSurface } from '../../../generated/toggle-group-item.metadata'
import { setupToggleGroupItem } from './setup.component'

@Component({
	selector: 'button[so-toggle-group-item], [so-toggle-group-item]',
	imports: [NgTemplateOutlet],
	changeDetection: ChangeDetectionStrategy.OnPush,
	templateUrl: './toggle-group-item.component.html',
})
export class TToggleGroupItemComponent extends TToggleGroupItemSurface<IToggleGroupItem> {
	constructor() {
		super(setupToggleGroupItem, { strategy: 'host', defaults: { type: 'button' } })
	}
}

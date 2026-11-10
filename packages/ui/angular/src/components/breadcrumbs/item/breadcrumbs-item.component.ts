import { Component, ChangeDetectionStrategy } from '@angular/core'
import { NgTemplateOutlet } from '@angular/common'
import type { IBreadcrumbsItem } from '@soxa-ui/core'
import { AttributesDirective, SlotDirective } from '../../../adapter'
import { TItemRowComponent } from '../../item-row'
import { TButtonComponent } from '../../button'
import { TMenuComponent } from '../../menu'
import { TBreadcrumbsOverflowItemComponent } from '../overflow-item.component'
import { TBreadcrumbsItemSurface } from '../../../generated/breadcrumbs-item.metadata'
import { setupBreadcrumbsItem } from './setup.component'
@Component({
	selector: 'li[so-breadcrumbs-item], [so-breadcrumbs-item]',
	imports: [
		NgTemplateOutlet,
		AttributesDirective,
		SlotDirective,
		TItemRowComponent,
		TButtonComponent,
		TMenuComponent,
		TBreadcrumbsOverflowItemComponent,
	],
	changeDetection: ChangeDetectionStrategy.OnPush,
	templateUrl: './breadcrumbs-item.component.html',
})
export class TBreadcrumbsItemComponent extends TBreadcrumbsItemSurface<IBreadcrumbsItem> {
	constructor() {
		super(setupBreadcrumbsItem, {
			strategy: 'host',
			sets: ['dataset'],
			control: true,
			order: 'order',
			shownBy: 'breadcrumbs_shown',
		})
	}
}

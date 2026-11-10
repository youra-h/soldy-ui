import { Component, ChangeDetectionStrategy } from '@angular/core'
import { NgTemplateOutlet } from '@angular/common'
import type { IMenuItem } from '@soxa-ui/core'
import { AttributesDirective } from '../../../adapter'
import { TItemRowComponent } from '../../item-row'
import { TBreadcrumbsOverflowItemSurface } from '../../../generated/breadcrumbs-overflow-item.metadata'
import { setupBreadcrumbsOverflowItem } from './setup.component'

/** Internal Menu.Item assembly with a native anchor as its row. */

@Component({
	selector: 'div[so-breadcrumbs-overflow-item]',
	imports: [NgTemplateOutlet, AttributesDirective, TItemRowComponent],
	changeDetection: ChangeDetectionStrategy.OnPush,
	templateUrl: './overflow-item.component.html',
})
export class TBreadcrumbsOverflowItemComponent extends TBreadcrumbsOverflowItemSurface<IMenuItem> {
	constructor() {
		super(setupBreadcrumbsOverflowItem, {
			strategy: 'host',
			sets: ['attrs', 'dataset'],
			control: true,
		})
	}
}

import { Component, ChangeDetectionStrategy } from '@angular/core'
import { NgTemplateOutlet } from '@angular/common'
import type { IMenuItem } from '@soxa-ui/core'
import { AttributesDirective } from '../../adapter'
import { TItemRowComponent } from '../item-row'
import { TMenuItemSurface } from '../../generated/menu-item.metadata'
import { setupMenuItem } from '../menu/item/setup.component'
/** Internal Menu.Item assembly with a native anchor as its row. */
@Component({
	selector: 'div[so-breadcrumbs-overflow-item]',
	imports: [NgTemplateOutlet, AttributesDirective, TItemRowComponent],
	changeDetection: ChangeDetectionStrategy.OnPush,
	template: `<a
		so-item-row
		#control
		embedded="menu.row"
		[size]="state()['size']"
		[disabled]="state()['disabled']"
		[so-attributes]="state()['aria']"
		(click)="!$event.defaultPrevented && facade()?.context?.adapters.menu.choose()"
	>
		@if (slot('default'); as content) {
			<ng-container
				[ngTemplateOutlet]="content"
				[ngTemplateOutletContext]="{ text: state()['text'] ?? '' }"
			/>
		} @else {
			<ng-content>{{ state()['text'] }}</ng-content>
		}
	</a>`,
})
export class TBreadcrumbsOverflowItemComponent extends TMenuItemSurface<IMenuItem> {
	constructor() {
		super(setupMenuItem, { strategy: 'host', sets: ['attrs', 'dataset'], control: true })
	}
}

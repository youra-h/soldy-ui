import { Component, ChangeDetectionStrategy } from '@angular/core'
import { NgTemplateOutlet } from '@angular/common'
import type { IBreadcrumbs, IMenu } from '@soxa-ui/core'
import { AttributesDirective, SlotDirective, provideElevator } from '../../adapter'
import { TButtonComponent } from '../button'
import { TMenuComponent } from '../menu'
import { TBreadcrumbsSurface } from '../../generated/breadcrumbs.metadata'
import { TBreadcrumbsOverflowItemComponent } from './overflow-item.component'
import { setupBreadcrumbs } from './setup.component'
@Component({
	selector: 'nav[so-breadcrumbs], [so-breadcrumbs]',
	imports: [
		NgTemplateOutlet,
		AttributesDirective,
		SlotDirective,
		TButtonComponent,
		TMenuComponent,
		TBreadcrumbsOverflowItemComponent,
	],
	providers: [provideElevator()],
	changeDetection: ChangeDetectionStrategy.OnPush,
	templateUrl: './breadcrumbs.component.html',
})
export class TBreadcrumbsComponent extends TBreadcrumbsSurface<IBreadcrumbs> {
	protected menu: IMenu | undefined
	constructor() {
		super(
			(ctrl, inputs) => {
				const binding = setupBreadcrumbs(ctrl, inputs)
				this.menu = binding.menu
				return binding
			},
			{ strategy: 'host' },
		)
	}
}

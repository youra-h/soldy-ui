import { Component, ChangeDetectionStrategy } from '@angular/core'
import { NgTemplateOutlet } from '@angular/common'
import type { IBreadcrumbs } from '@soxa-ui/core'
import { SlotDirective, provideElevator } from '../../adapter'
import { TBreadcrumbsSurface } from '../../generated/breadcrumbs.metadata'
import { TBreadcrumbsItemComponent } from './item'
import { setupBreadcrumbs } from './setup.component'
@Component({
	selector: 'nav[so-breadcrumbs], [so-breadcrumbs]',
	imports: [NgTemplateOutlet, SlotDirective, TBreadcrumbsItemComponent],
	providers: [provideElevator()],
	changeDetection: ChangeDetectionStrategy.OnPush,
	templateUrl: './breadcrumbs.component.html',
})
export class TBreadcrumbsComponent extends TBreadcrumbsSurface<IBreadcrumbs> {
	constructor() {
		super((ctrl, inputs) => setupBreadcrumbs(ctrl, inputs, this.engine), { strategy: 'host' })
	}
}

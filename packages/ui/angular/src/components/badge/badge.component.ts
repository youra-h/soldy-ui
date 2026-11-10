import { Component, ChangeDetectionStrategy } from '@angular/core'
import type { IBadge } from '@soxa-ui/core'
import { AttributesDirective } from '../../adapter'
import { TBadgeSurface } from '../../generated/badge.metadata'
import { setupBadge } from './setup.component'

@Component({
	selector: 'span[so-badge], [so-badge]',
	imports: [AttributesDirective],
	changeDetection: ChangeDetectionStrategy.OnPush,
	templateUrl: './badge.component.html',
})
export class TBadgeComponent extends TBadgeSurface<IBadge> {
	constructor() {
		super(setupBadge, { strategy: 'host', sets: ['attrs', 'dataset'] })
	}
}

import { Component, ChangeDetectionStrategy } from '@angular/core'
import { NgTemplateOutlet } from '@angular/common'
import type { IAlert } from '@soxa-ui/core'
import { AttributesDirective, RoleIconDirective } from '../../adapter'
import { TButtonComponent } from '../button'
import { TIconComponent } from '../icon'
import { TAlertSurface } from '../../generated/alert.metadata'
import { setupAlert } from './setup.component'

@Component({
	selector: 'div[so-alert], [so-alert]',
	imports: [
		NgTemplateOutlet,
		AttributesDirective,
		RoleIconDirective,
		TButtonComponent,
		TIconComponent,
	],
	changeDetection: ChangeDetectionStrategy.OnPush,
	templateUrl: './alert.component.html',
})
export class TAlertComponent extends TAlertSurface<IAlert> {
	constructor() {
		super(setupAlert, { strategy: 'host' })
	}

	protected close(): void {
		this.instance()?.hide()
	}
}

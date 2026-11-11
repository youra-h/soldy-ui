import { Component, ChangeDetectionStrategy } from '@angular/core'
import { NgTemplateOutlet } from '@angular/common'
import type { IAvatar } from '@soxa-ui/core'
import { TAvatarSurface } from '../../generated/avatar.metadata'
import { setupAvatar } from './setup.component'

@Component({
	selector: 'span[so-avatar], [so-avatar]',
	imports: [NgTemplateOutlet],
	changeDetection: ChangeDetectionStrategy.OnPush,
	templateUrl: './avatar.component.html',
})
export class TAvatarComponent extends TAvatarSurface<IAvatar> {
	constructor() {
		super(setupAvatar, { strategy: 'host' })
	}
}

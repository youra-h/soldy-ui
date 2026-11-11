import { Component, ChangeDetectionStrategy } from '@angular/core'
import { NgTemplateOutlet } from '@angular/common'
import type { IAvatarGroup } from '@soxa-ui/core'
import { TAvatarGroupSurface } from '../../../generated/avatar-group.metadata'
import { setupAvatarGroup } from './setup.component'

@Component({
	selector: 'span[so-avatar-group], [so-avatar-group]',
	imports: [NgTemplateOutlet],
	changeDetection: ChangeDetectionStrategy.OnPush,
	templateUrl: './avatar-group.component.html',
})
export class TAvatarGroupComponent extends TAvatarGroupSurface<IAvatarGroup> {
	constructor() {
		super(setupAvatarGroup, { strategy: 'host' })
	}
}

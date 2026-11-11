import { Component, ChangeDetectionStrategy } from '@angular/core'
import type { ICodeBlock } from '@soxa-ui/core'
import { NgTemplateOutlet } from '@angular/common'
import { AttributesDirective, SlotDirective, RoleIconDirective } from '../../adapter'
import { TButtonComponent } from '../button'
import { TIconComponent } from '../icon'
import { TTabsComponent, TTabsContentComponent } from '../tabs'
import { TCodeBlockSurface } from '../../generated/code-block.metadata'
import { setupCodeBlock } from './setup.component'
@Component({
	selector: 'div[so-code-block], [so-code-block]',
	imports: [
		NgTemplateOutlet,
		SlotDirective,
		AttributesDirective,
		TButtonComponent,
		TIconComponent,
		RoleIconDirective,
		TTabsComponent,
		TTabsContentComponent,
	],
	changeDetection: ChangeDetectionStrategy.OnPush,
	templateUrl: './code-block.component.html',
})
export class TCodeBlockComponent extends TCodeBlockSurface<ICodeBlock> {
	constructor() {
		super(setupCodeBlock, { strategy: 'host' })
	}
}

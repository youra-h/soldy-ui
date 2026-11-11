import { Component, ChangeDetectionStrategy } from '@angular/core'
import type { ISeparator } from '@soxa-ui/core'
import { TSeparatorSurface } from '../../generated/separator.metadata'
import { setupSeparator } from './setup.component'

@Component({
	selector: 'div[so-separator], [so-separator]',
	changeDetection: ChangeDetectionStrategy.OnPush,
	template: '',
})
export class TSeparatorComponent extends TSeparatorSurface<ISeparator> {
	constructor() {
		super(setupSeparator, { strategy: 'host' })
	}
}

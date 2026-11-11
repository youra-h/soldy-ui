import { describe, it, expect } from 'vitest'
import { Component } from '@angular/core'
import { SlotDirective, TCodeBlockComponent } from '@soxa-ui/angular'
import { TCodeBlock } from '@soxa-ui/core'
import { mountHost, findIn } from './mount'
@Component({ imports: [TCodeBlockComponent], template: '<div so-code-block [ctrl]="ctrl"></div>' })
class CodeBlockHost {
	readonly ctrl = new TCodeBlock({
		snippets: [
			{ value: 'one', label: 'One', code: 'first' },
			{ value: 'two', label: 'Two', code: '<script>second</script>\n' },
		],
	})
}
@Component({
	imports: [TCodeBlockComponent, SlotDirective],
	template:
		'<div so-code-block code="source"><ng-template slot="copy"><span>Copy source</span></ng-template></div>',
})
class CustomCopyHost {}

describe('CodeBlock', () => {
	it('renders custom copy content inside the accessible built-in button', () => {
		const fixture = mountHost(CustomCopyHost)
		const button = findIn(fixture, '.so-code-block__copy', HTMLButtonElement)
		expect(button.textContent).toBe('Copy source')
		expect(button.getAttribute('aria-label')).toBe('Copy')
		expect(button.querySelector('svg')).toBeNull()
	})
	it('updates Tabs panels and empty state with the shared instance', () => {
		const fixture = mountHost(CodeBlockHost)
		expect(findIn(fixture, 'code', HTMLElement).textContent).toBe('first')
		fixture.componentInstance.ctrl.value = 'two'
		fixture.detectChanges()
		expect(findIn(fixture, 'code', HTMLElement).textContent).toBe('<script>second</script>\n')
		fixture.componentInstance.ctrl.snippets = []
		fixture.detectChanges()
		expect(findIn(fixture, '.so-code-block__copy', HTMLButtonElement).disabled).toBe(true)
	})
})

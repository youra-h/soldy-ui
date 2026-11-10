import { describe, it, expect } from 'vitest'
import { Component } from '@angular/core'
import { TCodeBlockComponent } from '@soxa-ui/angular'
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
describe('CodeBlock', () => {
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

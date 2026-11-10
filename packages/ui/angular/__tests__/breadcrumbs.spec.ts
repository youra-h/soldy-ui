import { describe, it, expect } from 'vitest'
import { Component, signal } from '@angular/core'
import { TBreadcrumbsComponent } from '@soxa-ui/angular'
import { mountHost, nextFrame } from './mount'

@Component({
	imports: [TBreadcrumbsComponent],
	template: '<nav so-breadcrumbs [items]="items" [maxItems]="max()"></nav>',
})
class BreadcrumbsHost {
	readonly items = [
		{ text: 'Home', href: '#home' },
		{ text: 'Catalog', href: '#catalog', target: '_blank', rel: 'external' },
		{ text: 'Group' },
		{ text: 'Phones', href: '#phones' },
		{ text: 'Current' },
	]
	readonly max = signal(3)
}
describe('Breadcrumbs', () => {
	it('keeps one li per visible position and native hidden links', async () => {
		const fixture = mountHost(BreadcrumbsHost)

		await nextFrame()
		const root = fixture.nativeElement.querySelector('nav') as HTMLElement

		expect(root.querySelectorAll('ol > li')).toHaveLength(3)
		expect(root.querySelectorAll('[aria-current="page"]')).toHaveLength(1)

		root.querySelector('button')?.click()
		fixture.detectChanges()
		await nextFrame()
		const row = document.querySelector('a[role="menuitem"][href="#catalog"]')

		expect(row?.getAttribute('target')).toBe('_blank')
		expect(row?.getAttribute('rel')).toBe('external')

		fixture.componentInstance.max.set(0)
		fixture.detectChanges()
		await fixture.whenStable()

		expect(root.querySelectorAll('ol > li')).toHaveLength(5)
		expect(root.querySelector('button')).toBeNull()
	})
})

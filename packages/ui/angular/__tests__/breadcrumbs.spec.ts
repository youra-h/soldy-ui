import { createEngineBreadcrumbs } from '@soxa-ui/core'
import { describe, it, expect } from 'vitest'
import { Component, signal } from '@angular/core'
import { TBreadcrumbsComponent, TBreadcrumbsItemComponent } from '@soxa-ui/angular'
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
		{ text: 'Current', _: { active: true } },
	]
	readonly max = signal(3)
}
@Component({
	imports: [TBreadcrumbsComponent, TBreadcrumbsItemComponent],
	template: `<nav so-breadcrumbs [engine]="engine" [maxItems]="max()">
		<li so-breadcrumbs-item text="Home" href="#home"></li>
		<li so-breadcrumbs-item text="Catalog" href="#catalog"></li>
		<li so-breadcrumbs-item text="Group"></li>
		<li so-breadcrumbs-item text="Phones" href="#phones"></li>
		<li so-breadcrumbs-item text="Current" active></li>
	</nav>`,
})
class BreadcrumbsItemsHost {
	readonly engine = createEngineBreadcrumbs()
	readonly max = signal(3)
}
describe('Breadcrumbs', () => {
	it('keeps one li per visible position and native hidden links', async () => {
		const fixture = mountHost(BreadcrumbsHost)

		await nextFrame()
		const root = fixture.nativeElement.querySelector('nav') as HTMLElement

		expect(root.querySelectorAll('ol > li')).toHaveLength(5)
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
	it('keeps declarative Item in one collection through collapse and releases them with the owner', async () => {
		const fixture = mountHost(BreadcrumbsItemsHost)
		await nextFrame()
		const engine = fixture.componentInstance.engine
		const before = [...engine.extensions.batch.items]
		expect(before).toHaveLength(5)
		expect(engine.extensions.activation.activeItem).toBe(before[4])
		const root: HTMLElement = fixture.nativeElement.querySelector('nav')
		expect(root.querySelectorAll('[aria-current="page"]')).toHaveLength(1)
		fixture.componentInstance.max.set(0)
		fixture.detectChanges()
		await fixture.whenStable()
		expect(engine.extensions.batch.items).toEqual(before)
		fixture.destroy()
		expect(engine.extensions.batch.items).toHaveLength(0)
		expect(engine.options.get('owner')).toBeUndefined()
	})
})

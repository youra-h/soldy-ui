import { Component } from '@angular/core'
import { it, expect } from 'vitest'
import { TAvatar, TAvatarGroup } from '@soxa-ui/core'
import { SlotDirective, TAvatarComponent, TAvatarGroupComponent } from '@soxa-ui/angular'
import { mountHost, findIn } from './mount'
@Component({
	imports: [TAvatarComponent, TAvatarGroupComponent, SlotDirective],
	template: `<span so-avatar-group [ctrl]="group"
		><span so-avatar [ctrl]="ctrl" aria_label="Ada"></span
		><ng-template slot="overflow-content" let-count="count"
			><b>{{ count }}</b></ng-template
		></span
	>`,
})
class AvatarHost {
	readonly ctrl = new TAvatar({ initials: 'AL' })
	readonly group = new TAvatarGroup({ overflow: 3 })
}
it('renders external state, decorative image and scoped explicit overflow', () => {
	const fixture = mountHost(AvatarHost),
		host = fixture.componentInstance,
		root = findIn(fixture, '[so-avatar-group]', HTMLElement)
	expect(root.querySelector('b')?.textContent).toBe('3')
	expect(root.getAttribute('aria-hidden')).toBeNull()
	host.ctrl.src = 'a'
	host.ctrl.status = 'loaded'
	fixture.detectChanges()
	expect(root.querySelector('img')?.getAttribute('alt')).toBe('')
	host.ctrl.src = 'b'
	host.ctrl.initials = 'GH'
	host.group.overflow = 0
	fixture.detectChanges()
	expect(root.querySelector('img')).toBeNull()
	expect(root.querySelector('.so-avatar__fallback')?.textContent?.trim()).toBe('GH')
	expect(root.querySelector('.so-avatar-group__overflow')).toBeNull()
})

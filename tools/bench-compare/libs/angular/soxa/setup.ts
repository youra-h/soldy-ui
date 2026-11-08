import { ChangeDetectionStrategy, Component, ViewContainerRef, viewChild } from '@angular/core'
import { LocaleProviderDirective, provideAttrs } from '@soxa-ui/angular'
import * as material from '@soxa-ui/icons-material'
import { enUS } from '@soxa-ui/plugins'
import { useIcons, useTheme } from '@soxa-ui/setup'
import '@soxa-ui/theme-oren'
import oren from '@soxa-ui/theme-oren/setup'
import type { IPageRoot } from '../mount'

/**
 * soxa as an application sets it up (README of the packages): the adapter's
 * renderer in the application, the icon pack, the theme with its behavior,
 * the locale provider at the root — as the host of the developer stand does.
 * Only the size entries use these files: the runtime pages of soxa are the
 * hosts themselves (`tools/bench-pages`).
 */
useIcons(material)
useTheme(oren)

export const providers = [provideAttrs()]

@Component({
	selector: 'bench-soxa-root',
	imports: [LocaleProviderDirective],
	changeDetection: ChangeDetectionStrategy.OnPush,
	host: { style: 'display: contents' },
	template: `
		<ng-container so-locale-provider [locale]="locale">
			<ng-container #outlet />
		</ng-container>
	`,
})
export class Root implements IPageRoot {
	protected readonly locale = enUS
	readonly outlet = viewChild.required('outlet', { read: ViewContainerRef })
}

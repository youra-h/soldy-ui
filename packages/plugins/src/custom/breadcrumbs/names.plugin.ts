import type { IBreadcrumbs } from '@soxa-ui/core'
import { TNamesPlugin } from '../../locale/names.plugin'
import { BREADCRUMBS_NAMES } from '../../locale/locale'
import type { TTranslations } from '../../locale/types'

/** Name the landmark and overflow trigger from the nearest locale subtree. */
export class TBreadcrumbsNamesPlugin extends TNamesPlugin<IBreadcrumbs> {
	protected override _name(owner: IBreadcrumbs, translations: TTranslations): void {
		// Custom locales created before Breadcrumbs may omit this optional translation section.
		const names = translations.breadcrumbs ?? BREADCRUMBS_NAMES

		owner.aria.add('aria-label', names.navigation)
		owner.overflowAria.add('aria-label', names.overflow)
	}
}

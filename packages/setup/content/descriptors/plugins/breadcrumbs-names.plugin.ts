/**
 * Breadcrumbs names: localized navigation and overflow labels.
 */

import { definePlugin } from '../../../protected/define'
import { TBreadcrumbsNamesPlugin } from '@soxa-ui/plugins'

export const BreadcrumbsNamesPluginDescriptor = definePlugin({
	ctor: TBreadcrumbsNamesPlugin,
	namespace: 'names',
})

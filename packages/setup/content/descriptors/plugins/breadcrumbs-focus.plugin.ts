/**
 * Breadcrumbs focus: repair focus after a trail update.
 */

import { definePlugin } from '../../../protected/define'
import { TBreadcrumbsFocusPlugin } from '@soxa-ui/plugins'
export const BreadcrumbsFocusPluginDescriptor = definePlugin({
	ctor: TBreadcrumbsFocusPlugin,
	namespace: 'breadcrumbsFocus',
})

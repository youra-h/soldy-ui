/**
 * Badge indicator roles composed with the accessible-name plugin.
 */
import { definePlugin } from '../../../protected/define'
import { TBadgeAriaPlugin } from '@soxa-ui/plugins'

export const BadgeAriaPluginDescriptor = definePlugin({
	ctor: TBadgeAriaPlugin,
	namespace: 'badgeAria',
})

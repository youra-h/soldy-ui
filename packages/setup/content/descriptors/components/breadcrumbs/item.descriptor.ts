/**
 * Breadcrumbs.Item native navigation contract; activation belongs to its facade.
 */

import { defineComponent, defineDescriptor, defineType } from '../../../../protected/define'
import { TBreadcrumbsItem } from '@soxa-ui/core'
import { rowIn } from '@soxa-ui/plugins'
import { TextableDescriptor } from '../textable.descriptor'
import { OWNER_STYLE_PROPS } from '../stylable.descriptor'
import { ActionPluginDescriptor } from '../../plugins'
export const BreadcrumbsItemDescriptor = defineDescriptor(() =>
	defineComponent({
		ctor: TBreadcrumbsItem,
		extends: TextableDescriptor(),
		contribution: {
			slots: {
				leading: { description: 'Before location text' },
				default: {
					scope: {
						text: defineType<string>(String),
						active: defineType<boolean>(Boolean),
					},
					description: 'Location content',
				},
				trailing: { description: 'After location text' },
			},
			props: {
				...OWNER_STYLE_PROPS,
				href: { type: String, triggers: ['change:href'] },
				target: { type: String, triggers: ['change:target'] },
				rel: { type: String, triggers: ['change:rel'] },
			},
			events: ['change:href', 'change:target', 'change:rel'],
		},
		plugins: [ActionPluginDescriptor.with({ focusTarget: rowIn })],
	}),
)

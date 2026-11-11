/**
 * Describes the shared semantic boundary contract without slots or interaction plugins.
 */

import { defineComponent, defineDescriptor } from '../../../protected/define'
import { TSeparator } from '@soxa-ui/core'
import { ComponentViewDescriptor } from './component-view.descriptor'

export const SeparatorDescriptor = defineDescriptor(() =>
	defineComponent({
		ctor: TSeparator,
		extends: ComponentViewDescriptor(),
		contribution: {
			props: {
				orientation: { type: String, triggers: ['change:orientation'] },
				decorative: { type: Boolean, triggers: ['change:decorative'] },
			},
			events: ['change:orientation', 'change:decorative'],
		},
	}),
)

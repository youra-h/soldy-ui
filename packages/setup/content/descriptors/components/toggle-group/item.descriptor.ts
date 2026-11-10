/**
 * ToggleGroup item: a button whose selection belongs to its collection facade.
 */

import { defineComponent, defineDescriptor, defineType } from '../../../../protected/define'
import { TToggleGroupItem } from '@soxa-ui/core'
import { ButtonDescriptor } from '../button.descriptor'
import { OWNER_STYLE_PROPS } from '../stylable.descriptor'

export const ToggleGroupItemDescriptor = defineDescriptor(() =>
	defineComponent({
		ctor: TToggleGroupItem,
		extends: ButtonDescriptor(),
		contribution: {
			props: { ...OWNER_STYLE_PROPS },
			slots: {
				leading: {},
				default: {
					scope: {
						text: defineType<string>(String),
						selected: defineType<boolean>(Boolean),
					},
				},
				trailing: {},
			},
		},
	}),
)

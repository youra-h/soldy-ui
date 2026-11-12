/**
 * AlertDialog contract: a modal choice with localized actions and a replaceable footer.
 */

import { defineComponent, defineDescriptor, defineType } from '../../../protected/define'
import { TAlertDialog } from '@soxa-ui/core'
import {
	AlertDialogFocusPluginDescriptor,
	DialogIdsPluginDescriptor,
	AlertDialogLayoutPluginDescriptor,
	AlertDialogNamesPluginDescriptor,
} from '../plugins'
import { createModalLayerDescriptor } from './modal-layer.descriptor'

export const AlertDialogDescriptor = defineDescriptor(() =>
	defineComponent({
		ctor: TAlertDialog,
		extends: createModalLayerDescriptor(
			AlertDialogFocusPluginDescriptor.with({ property: 'visible', modal: true }),
		),
		contribution: {
			slots: {
				title: { description: 'Dialog title and accessible name' },
				default: { description: 'Explanation and accessible description' },
				action: { description: 'Content of the default confirmation button' },
				cancel: { description: 'Content of the default cancellation button' },
				footer: {
					description:
						'Replace the entire action row, including with an explicitly empty slot',
					scope: {
						confirm: defineType<() => void>(Function),
						cancel: defineType<() => void>(Function),
					},
				},
				'close-icon': { description: 'Close button icon' },
			},
			props: { bodyAria: { type: Object, protected: true, triggers: ['change:bodyAria'] } },
			events: ['confirm', 'cancel'],
		},
		plugins: [
			DialogIdsPluginDescriptor,
			AlertDialogLayoutPluginDescriptor,
			AlertDialogNamesPluginDescriptor,
		],
	}),
)

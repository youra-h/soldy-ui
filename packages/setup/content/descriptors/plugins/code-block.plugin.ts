/**
 * CodeBlock clipboard, source diagnostics and localized feedback plugins.
 */

import { definePlugin } from '../../../protected/define'
import {
	TCodeBlockCopyPlugin,
	TCodeBlockNamesPlugin,
	TCodeBlockSourcePlugin,
} from '@soxa-ui/plugins'

export const CodeBlockCopyPluginDescriptor = definePlugin({
	ctor: TCodeBlockCopyPlugin,
	namespace: 'clipboard',
})
export const CodeBlockNamesPluginDescriptor = definePlugin({
	ctor: TCodeBlockNamesPlugin,
	namespace: 'names',
	contribution: {
		props: {
			copy: { protected: true, triggers: ['change:copy'] },
			message: { protected: true, triggers: ['change:message'] },
		},
	},
})

export const CodeBlockSourcePluginDescriptor = definePlugin({
	ctor: TCodeBlockSourcePlugin,
	namespace: 'source',
})

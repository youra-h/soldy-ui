/**
 * CodeBlock display contract and its shared clipboard and locale plugins.
 */

import { defineComponent, defineDescriptor } from '../../../protected/define'
import { TCodeBlock } from '@soxa-ui/core'
import { StylableDescriptor } from './stylable.descriptor'
import {
	CodeBlockCopyPluginDescriptor,
	CodeBlockNamesPluginDescriptor,
	CodeBlockSourcePluginDescriptor,
} from '../plugins'

/** The adapters render snapshots; clipboard work and locale feedback stay shared. */
export const CodeBlockDescriptor = defineDescriptor(() =>
	defineComponent({
		ctor: TCodeBlock,
		extends: StylableDescriptor(),
		contribution: {
			slots: { 'title-icon': { description: 'Optional icon before the title' } },
			props: {
				code: { type: String, triggers: ['change:code'] },
				language: { type: String, triggers: ['change:language'] },
				title: { type: String, triggers: ['change:title'] },
				copyable: { type: Boolean, triggers: ['change:copyable'] },
				lineNumbers: { type: Boolean, triggers: ['change:lineNumbers'] },
				wrap: { type: Boolean, triggers: ['change:wrap'] },
				maxHeight: { type: [Number, String], triggers: ['change:maxHeight'] },
				highlightLines: { type: Array, triggers: ['change:highlightLines'] },
				snippets: { type: Array, triggers: ['change:snippets'] },
				value: { type: String, triggers: ['change:value'] },
				codeDataset: {
					type: Object,
					protected: true,
					triggers: ['change:language', 'change:value', 'change:snippets'],
				},
				contentAttrs: { type: Object, protected: true, triggers: ['change:contentAttrs'] },
				contentAria: { type: Object, protected: true, triggers: ['change:contentAria'] },
				tabbed: { protected: true, triggers: ['change:snippets'] },
				source: {
					protected: true,
					triggers: ['change:code', 'change:snippets', 'change:value'],
				},
				displayTitle: {
					protected: true,
					triggers: ['change:title', 'change:snippets', 'change:value'],
				},
				lines: {
					protected: true,
					triggers: [
						'change:code',
						'change:snippets',
						'change:value',
						'change:highlightLines',
						'change:language',
					],
				},
				panels: {
					protected: true,
					triggers: ['change:snippets', 'change:language', 'change:highlightLines'],
				},
				contentStyle: { protected: true, triggers: ['change:maxHeight'] },
				copyDisabled: {
					protected: true,
					triggers: [
						'change:code',
						'change:snippets',
						'change:value',
						'change:copyState',
					],
				},
			},
			events: [
				'change:code',
				'change:language',
				'change:title',
				'change:copyable',
				'change:lineNumbers',
				'change:wrap',
				'change:maxHeight',
				'change:highlightLines',
				'change:snippets',
				'change:value',
				'copy',
				'copy:error',
			],
		},
		plugins: [
			CodeBlockSourcePluginDescriptor,
			CodeBlockCopyPluginDescriptor,
			CodeBlockNamesPluginDescriptor,
		],
	}),
)

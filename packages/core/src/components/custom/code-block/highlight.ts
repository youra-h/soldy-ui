import { createLowlight } from 'lowlight'
import javascript from 'highlight.js/lib/languages/javascript'
import typescript from 'highlight.js/lib/languages/typescript'
import xml from 'highlight.js/lib/languages/xml'
import css from 'highlight.js/lib/languages/css'
import json from 'highlight.js/lib/languages/json'
import bash from 'highlight.js/lib/languages/bash'
import python from 'highlight.js/lib/languages/python'
import yaml from 'highlight.js/lib/languages/yaml'
import { codeLanguage } from './language'
import type { ICodeBlockLine } from './types'

type TNode = ReturnType<ReturnType<typeof createLowlight>['highlight']>['children'][number]
type TToken = NonNullable<ICodeBlockLine['tokens']>[number]
let highlighter: ReturnType<typeof createLowlight> | undefined
const CATEGORIES: Readonly<Record<string, string>> = {
	built_in: 'builtin',
	attr: 'attr-name',
	attribute: 'property',
	title: 'function',
	function_: 'function',
	literal: 'boolean',
	meta: 'keyword',
	name: 'tag',
}

/** Package-manager commands belong to shell examples, though Bash does not list them as builtins. */
function shell(hljs: Parameters<typeof bash>[0]): ReturnType<typeof bash> {
	const grammar = bash(hljs)
	return {
		...grammar,
		contains: [
			{ scope: 'built_in', match: /\b(?:npm|npx|pnpm|yarn|bun)(?=\s)/ },
			...(grammar.contains ?? []),
		],
	}
}

/** Tokenize the complete source, including multiline constructs, without creating HTML. */
export function codeTokens(code: string, language: string): readonly (readonly TToken[])[] {
	if (!highlighter) {
		highlighter = createLowlight({
			javascript,
			typescript,
			xml,
			css,
			json,
			bash: shell,
			python,
			yaml,
		})
		highlighter.registerAlias({
			javascript: ['jsx'],
			typescript: ['tsx'],
			xml: ['vue', 'svelte'],
		})
	}

	const lines: TToken[][] = [[]]
	const append = (text: string, types: readonly string[]): void => {
		// Keep CRLF indivisible and retain every source character in the token stream.
		const parts = text.split(/(\r\n|\r|\n)/)
		for (let index = 0; index < parts.length; index += 2) {
			const value = parts[index] + (parts[index + 1] ?? '')
			if (value)
				lines[lines.length - 1].push({
					text: value,
					dataset: { 'data-token': types.join(' ') },
				})
			if (index + 1 < parts.length) lines.push([])
		}
	}
	const visit = (node: TNode, inherited: readonly string[]): void => {
		if (node.type === 'text') append(node.value, inherited)
		else if (node.type === 'element') {
			const classes = node.properties.className
			const types = Array.isArray(classes)
				? classes
						.filter((name): name is string => typeof name === 'string')
						.map((name) => {
							const category = name.replace(/^hljs-/, '')
							return CATEGORIES[category] ?? category
						})
				: []
			for (const child of node.children) visit(child, types.length ? types : inherited)
		}
	}

	const normalized = codeLanguage(language)
	if (normalized === 'text') append(code, [])
	else for (const child of highlighter.highlight(normalized, code).children) visit(child, [])
	return lines
}

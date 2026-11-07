import { readdirSync, readFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import ts from 'typescript'

export type TEmission = { name: string; sources: string[] }
export type TInventory = {
	roots: TEmission[]
	parts: TEmission[]
	modifiers: TEmission[]
	data: TEmission[]
	dynamic: TEmission[]
}
export const EMITTER_ROOTS = [
	'packages/core/src',
	'packages/plugins/src',
	'packages/setup/content',
	'packages/setup/protected',
	'packages/themes/base/setup',
	...['vue', 'react', 'angular', 'solid', 'svelte', 'webc'].map(
		(adapter) => `packages/ui/${adapter}/src`,
	),
]

function files(dir: string): string[] {
	return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
		const file = join(dir, entry.name)
		return entry.isDirectory()
			? files(file)
			: /\.(?:ts|tsx|vue|svelte|html)$/.test(file)
				? [file]
				: []
	})
}

/** Collect emission names rather than CSS consumers, Angular selectors or custom-element names. */
export function collectSource(source: string, place: string, inventory: TInventory): void {
	const code = source
		.replace(/\/\*[\s\S]*?\*\/|<!--[\s\S]*?-->/g, '')
		.replace(/(^|[^:])\/\/.*$/gm, '$1')
	const add = (kind: keyof TInventory, name: string) => {
		const found = inventory[kind].find((entry) => entry.name === name)
		if (found) {
			if (!found.sources.includes(place)) found.sources.push(place)
		} else inventory[kind].push({ name, sources: [place] })
	}
	const className = (value: string) => {
		for (const name of value.match(/so-[a-z][\w-]*(?:__[\w-]+)?/g) ?? []) {
			if (name.endsWith('-') || name.endsWith('__')) continue
			add(name.includes('__') ? 'parts' : name.includes('--') ? 'modifiers' : 'roots', name)
		}
	}
	for (const match of code.matchAll(/\b(?:class|className)\s*=\s*["']([^"']*)["']/g))
		className(match[1])
	for (const match of code.matchAll(/(?:\s|:|\[attr\.)(data-[a-z][\w-]*)(?=\s|=|\]|>|\/)/g))
		add('data', match[1])
	const tree = ts.createSourceFile(place, code, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
	const visit = (node: ts.Node) => {
		if (
			ts.isPropertyDeclaration(node) &&
			node.name.getText(tree) === 'baseClass' &&
			node.initializer &&
			ts.isStringLiteral(node.initializer)
		)
			className(node.initializer.text)
		if (ts.isBinaryExpression(node) && /\.className$/.test(node.left.getText(tree))) {
			const value = node.right
			if (ts.isStringLiteral(value)) className(value.text)
			else if (ts.isTemplateExpression(value)) add('dynamic', value.getText(tree))
		}
		if (ts.isCallExpression(node)) {
			const receiver = node.expression.getText(tree)
			const first = node.arguments[0]
			if (
				/\.setAttribute$/.test(receiver) &&
				first &&
				(ts.isStringLiteral(first) || ts.isNoSubstitutionTemplateLiteral(first)) &&
				first.text === 'class'
			) {
				const value = node.arguments[1]
				if (value && ts.isStringLiteral(value)) className(value.text)
				else if (value) add('dynamic', value.getText(tree))
			}
			if (/(?:[dD]ataset)[\s\S]*\.(?:add|remove)$/.test(receiver) && first) {
				if (ts.isStringLiteral(first) || ts.isNoSubstitutionTemplateLiteral(first))
					add('data', first.text.startsWith('data-') ? first.text : `data-${first.text}`)
				else add('dynamic', first.getText(tree))
			}
			if (/(?:[cC]lasses)\??\.(?:add|toggle|swap|swapClass)$/.test(receiver) && first) {
				if (ts.isStringLiteral(first) || ts.isNoSubstitutionTemplateLiteral(first))
					add('modifiers', first.text)
				else if (ts.isObjectLiteralExpression(first)) {
					for (const prop of first.properties)
						if (
							ts.isPropertyAssignment(prop) &&
							/^(prefix|newClass)$/.test(prop.name.getText(tree))
						) {
							if (ts.isStringLiteral(prop.initializer))
								add('modifiers', prop.initializer.text)
							else add('dynamic', prop.initializer.getText(tree))
						}
				} else add('dynamic', first.getText(tree))
			}
			if (ts.isIdentifier(node.expression) && node.expression.text === 'TClasses')
				add('dynamic', node.getText(tree))
		}
		if (
			ts.isNewExpression(node) &&
			node.expression.getText(tree) === 'TClasses' &&
			node.arguments?.[0]
		) {
			if (ts.isStringLiteral(node.arguments[0])) className(node.arguments[0].text)
			else add('dynamic', node.arguments[0].getText(tree))
		}
		if (
			ts.isPropertyAssignment(node) &&
			node.name.getText(tree) === 'className' &&
			ts.isStringLiteral(node.initializer)
		)
			className(node.initializer.text)
		if (ts.isStringLiteral(node) && /^so-[a-z][\w-]*__[\w-]+$/.test(node.text))
			className(node.text)
		if (ts.isStringLiteral(node) && /^data-[a-z][\w-]+$/.test(node.text)) add('data', node.text)
		ts.forEachChild(node, visit)
	}
	visit(tree)
}

export function collectInventory(root: string): TInventory {
	const inventory: TInventory = { roots: [], parts: [], modifiers: [], data: [], dynamic: [] }
	for (const dir of EMITTER_ROOTS)
		for (const file of files(join(root, dir)))
			collectSource(
				readFileSync(file, 'utf8'),
				relative(root, file).replaceAll('\\', '/'),
				inventory,
			)
	// These cross-module constant names are resolved explicitly; their use sites remain audited.
	for (const entry of inventory.dynamic) {
		const name =
			entry.name === 'LIST_CONTENT_FIT_ATTRIBUTE'
				? 'data-content-fit'
				: entry.name === 'LIST_INDICATOR_ATTRIBUTE'
					? 'data-indicator'
					: undefined
		if (name) inventory.data.push({ name, sources: [...entry.sources] })
	}
	for (const entries of Object.values(inventory)) {
		entries.sort((a, b) => a.name.localeCompare(b.name))
		for (const entry of entries) entry.sources.sort()
	}
	return inventory
}

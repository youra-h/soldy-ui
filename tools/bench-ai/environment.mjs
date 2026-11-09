import { parse, compileStyle } from 'vue/compiler-sfc'
import ts from 'typescript'

const allowed = (name) =>
	['vue', 'vue/server-renderer', 'vue/jsx-runtime', 'vue/jsx-dev-runtime'].includes(name) ||
	/^vue\/dist\/[^/]+\.js$/.test(name)

/** Audits authored SFC imports before compiler helpers are introduced. This is not a sandbox. */
export function auditEnvironment(source, filename = 'Candidate.vue') {
	const { descriptor, errors } = parse(source, { filename })
	const imports = []
	const violations = []
	const record = (literal, kind) => {
		const name = literal && ts.isStringLiteralLike(literal) ? literal.text : null
		imports.push({ kind, specifier: name })
		if (name === null) violations.push(`${kind}: unknown/computed import`)
		else if (!allowed(name))
			violations.push(`${kind}: import outside the declared Vue runtime: ${name}`)
	}
	for (const [kind, block] of [
		['script', descriptor.script],
		['script setup', descriptor.scriptSetup],
		['template', descriptor.template],
		...descriptor.styles.map((block) => ['style', block]),
		...descriptor.customBlocks.map((block) => ['custom block', block]),
	]) {
		if (block?.src) violations.push(`${kind}: external src is not self-contained`)
	}
	for (const block of [descriptor.script, descriptor.scriptSetup].filter(Boolean)) {
		const kind = ['jsx', 'tsx'].includes(block.lang)
			? ts.ScriptKind.TSX
			: block.lang === 'ts'
				? ts.ScriptKind.TS
				: ts.ScriptKind.JS
		const file = ts.createSourceFile(
			filename,
			block.content,
			ts.ScriptTarget.Latest,
			true,
			kind,
		)
		const visit = (node) => {
			if (
				ts.isImportDeclaration(node) ||
				(ts.isExportDeclaration(node) && node.moduleSpecifier)
			)
				record(node.moduleSpecifier, 'static')
			if (
				ts.isImportEqualsDeclaration(node) &&
				ts.isExternalModuleReference(node.moduleReference)
			)
				record(node.moduleReference.expression, 'static require')
			if (
				ts.isCallExpression(node) &&
				(node.expression.kind === ts.SyntaxKind.ImportKeyword ||
					(ts.isIdentifier(node.expression) && node.expression.text === 'require'))
			)
				record(node.arguments[0], 'dynamic')
			if (ts.isImportTypeNode(node))
				record(ts.isLiteralTypeNode(node.argument) ? node.argument.literal : null, 'type')
			ts.forEachChild(node, visit)
		}
		visit(file)
	}
	for (const style of descriptor.styles) {
		const parsed = compileStyle({
			source: style.content,
			filename,
			id: 'data-v-environment-audit',
			scoped: false,
		})
		parsed.rawResult?.root.walkAtRules('import', () =>
			violations.push('style: @import is not self-contained'),
		)
	}
	return {
		status: violations.length ? 'protocol-violation' : 'within-declared-runtime',
		imports,
		violations,
		parseErrors: errors.map((error) => (typeof error === 'string' ? error : error.message)),
		scope: 'Authored script import/export/require, SFC block src and CSS @import only; no claim of a complete Node security sandbox or arbitrary runtime-network enforcement',
	}
}

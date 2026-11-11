const ALIASES: Readonly<Record<string, string>> = {
	js: 'javascript',
	ts: 'typescript',
	sh: 'bash',
	yml: 'yaml',
}
const LANGUAGES = new Set([
	'text',
	'javascript',
	'typescript',
	'jsx',
	'tsx',
	'html',
	'css',
	'json',
	'bash',
	'vue',
	'svelte',
	'python',
	'yaml',
])
/** Language names are case-insensitive; unknown names retain the complete plain-text rendering. */
export function codeLanguage(language: string): string {
	const lower = language.trim().toLowerCase()
	const resolved = ALIASES[lower] ?? lower
	return LANGUAGES.has(resolved) ? resolved : 'text'
}

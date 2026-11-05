/** Git-native commit-message guard, independent of the AI client. */
import { readFileSync } from 'node:fs'

const file = process.argv[2]
if (!file) throw new Error('Usage: node tools/agent-flow/check-commit.mjs <message-file>')
const message = readFileSync(file, 'utf8')
	.split(/\r?\n/)
	.filter((line) => !line.startsWith('#'))
	.join('\n')
if (/[\u0400-\u04ff]/.test(message)) {
	console.error('Commit messages must be written in English.')
	process.exitCode = 1
}
if (
	/^co-authored-by:.*(?:claude|anthropic)|generated (?:with|by).*(?:claude|anthropic)/im.test(
		message,
	)
) {
	console.error('Do not add Claude/Anthropic attribution.')
	process.exitCode = 1
}

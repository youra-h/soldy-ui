import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { format, resolveConfig } from 'prettier'
import { root } from './discover'
import { generateApi } from './generate'

const args = process.argv.slice(2)
if (
	args.some((arg) => !['--check', '--package', '--check-package'].includes(arg)) ||
	args.length > 1
) {
	throw new Error('Usage: generate:api [--check | --package | --check-package]')
}

const api = await generateApi()
const checking = args.includes('--check') || args.includes('--check-package')
const packaged = args.includes('--package') || args.includes('--check-package')
const output = resolve(
	root,
	packaged ? 'packages/setup/dist/api.json' : 'docs/api/generated/contract.json',
)
const manifest = JSON.parse(readFileSync(resolve(root, 'packages/setup/package.json'), 'utf8'))
if (packaged && manifest.exports['./api.json'] !== './dist/api.json')
	throw new Error('The API metadata export must point to dist/api.json')
const data = packaged ? { ...api, libraryVersion: manifest.version } : api
const config = await resolveConfig(output, { editorconfig: true })
const content = await format(JSON.stringify(data), { ...config, filepath: output })

if (checking) {
	if (readFileSync(output, 'utf8').replace(/\r\n/g, '\n') !== content) {
		throw new Error(
			packaged
				? 'Packaged API metadata has drifted. Rebuild @soxa-ui/setup.'
				: 'API documentation has drifted. Run npm run generate:api and commit the result.',
		)
	}
} else {
	mkdirSync(dirname(output), { recursive: true })
	writeFileSync(output, content)
}

console.log(
	`${api.components.length} components, ${Object.keys(api.contracts).length} contracts, ${Object.keys(api.plugins).length} plugins: ${checking ? 'checked' : 'generated'}`,
)

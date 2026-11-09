import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..')
test('actual runner distinguishes missing, modified, compile-failed and runtime-failed candidate inputs', () => {
	const temporary = path.join(root, 'tools/bench-ai/.vitest')
	fs.mkdirSync(temporary, { recursive: true })
	const directory = fs.mkdtempSync(path.join(temporary, 'input-test-'))
	const run = (source, destination) => {
		const child = spawnSync(process.execPath, ['tools/bench-ai/run.mjs', source, destination], {
			cwd: root,
			encoding: 'utf8',
		})
		assert.notEqual(child.status, 0)
		return JSON.parse(fs.readFileSync(path.join(destination, 'results.json')))
	}
	try {
		assert.equal(
			run(path.join(directory, 'absent.vue'), path.join(directory, 'missing')).status,
			'not-run',
		)
		const source =
			'<script setup>const broken = {{{</script><template><p>Test fixture</p></template>'
		const candidate = path.join(directory, 'Candidate.vue')
		fs.writeFileSync(candidate, source)
		fs.writeFileSync(
			path.join(directory, 'manifest.json'),
			JSON.stringify({ component: 'tabs', sourceHash: 'wrong-hash' }),
		)
		assert.equal(run(candidate, path.join(directory, 'modified')).status, 'invalid-input')
		fs.writeFileSync(
			path.join(directory, 'manifest.json'),
			JSON.stringify({
				component: 'tabs',
				sourceHash: crypto.createHash('sha256').update(source).digest('hex'),
			}),
		)
		assert.equal(run(candidate, path.join(directory, 'compile')).status, 'compile-failed')
		const runtimeSource =
			'<script>throw new Error("Intentional SSR module failure fixture"); export default {}</script><template><p>Test fixture only</p></template>'
		fs.writeFileSync(candidate, runtimeSource)
		fs.writeFileSync(
			path.join(directory, 'manifest.json'),
			JSON.stringify({
				component: 'tabs',
				sourceHash: crypto.createHash('sha256').update(runtimeSource).digest('hex'),
			}),
		)
		assert.equal(run(candidate, path.join(directory, 'runtime')).status, 'runtime-failed')
	} finally {
		const real = fs.realpathSync(directory)
		assert.equal(path.dirname(real), fs.realpathSync(temporary))
		assert(path.basename(real).startsWith('input-test-'))
		fs.rmSync(real, { recursive: true, force: true })
	}
})

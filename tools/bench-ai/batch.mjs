import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { components } from './protocol.mjs'

const [inputs, outputs] = process.argv.slice(2)
if (!inputs || !outputs)
	throw new Error('Usage: node tools/bench-ai/batch.mjs <inputs> <new-outputs>')
if (fs.existsSync(outputs)) throw new Error('Refusing to overwrite validation observations')
fs.mkdirSync(outputs, { recursive: true })
const execution = []
for (const slot of [1, 2])
	for (const component of components) {
		const cell = `${slot}-${component}`
		const limitMs = 10 * 60000
		const child = spawnSync(
			process.execPath,
			[
				'tools/bench-ai/run.mjs',
				path.resolve(inputs, cell, 'Candidate.vue'),
				path.resolve(outputs, cell),
			],
			{ stdio: 'inherit', timeout: limitMs, killSignal: 'SIGTERM' },
		)
		const processResult = {
			cell,
			originalExitCode: child.status,
			signal: child.signal,
			error: child.error?.code ?? null,
			limitMs,
		}
		execution.push(processResult)
		const folder = path.resolve(outputs, cell)
		fs.mkdirSync(folder, { recursive: true })
		fs.writeFileSync(
			path.join(folder, 'execution.json'),
			JSON.stringify(processResult, null, '\t') + '\n',
		)
		fs.writeFileSync(
			path.join(outputs, 'execution.json'),
			JSON.stringify(execution, null, '\t') + '\n',
		)
	}
if (execution.some((cell) => cell.originalExitCode !== 0)) process.exitCode = 1

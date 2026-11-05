#!/usr/bin/env node
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { callTool, listTools } from './protocol.mjs'
import { api, clickupToken, credentialsPath } from './clickup-api.mjs'
import { acquireLease, leaseWorkspace, releaseLease, unlockTask } from './leases.mjs'
import { poolSnapshot } from './pool.mjs'

const [command = 'help', ...args] = process.argv.slice(2)
const commands = JSON.parse(readFileSync(new URL('./commands.json', import.meta.url), 'utf8'))
const output = (value) => console.log(JSON.stringify(value, null, 2))
try {
	switch (command) {
		case 'tools':
			output(listTools())
			break
		case 'call': {
			if (args[1] !== '--input' || !args[2] || args.length !== 3)
				throw new Error('Usage: call <tool> --input <JSON-file>')
			output(await callTool(args[0], JSON.parse(readFileSync(args[2], 'utf8'))))
			break
		}
		case 'doctor': {
			clickupToken()
			const { user } = await api('/user')
			const tasks = await callTool('clickup_list_by_status', { status: 'planning' })
			output({
				authenticated: Boolean(user?.id),
				planningTasks: tasks.length,
				credentialFile: credentialsPath(),
				pool: poolSnapshot().rows.length,
			})
			break
		}
		case 'acquire': {
			if (args.length > 2 || (args[1] && args[1] !== '--write'))
				throw new Error('Usage: acquire <id> [--write]')
			output(acquireLease(process.cwd(), args[0], args[1] === '--write'))
			break
		}
		case 'lease-workspace':
			output(leaseWorkspace(process.cwd(), args[0]))
			break
		case 'release':
			output(releaseLease(process.cwd(), args[0]))
			break
		case 'unlock':
			output(unlockTask(process.cwd(), args[0]))
			break
		case 'pool':
			output(poolSnapshot())
			break
		case 'prompt': {
			if (!Object.hasOwn(commands, args[0])) throw new Error('Unknown workflow command')
			const spec = commands[args[0]]
			console.log(
				`Run ${args[0]} ${args.slice(1).join(' ')}\nRead ${fileURLToPath(new URL('./commands.md', import.meta.url))}\nRead ${fileURLToPath(new URL('./workflow.md', import.meta.url))}${spec.role ? `\nRead ${fileURLToPath(new URL(`./roles/${spec.role}.md`, import.meta.url))}` : ''}`,
			)
			break
		}
		default:
			output({
				commands: [
					'tools',
					'call <tool> --input <file>',
					'doctor (read-only)',
					'pool',
					'acquire <id> [--write]',
					'lease-workspace <token>',
					'release <token>',
					'unlock <id>',
					'prompt <command> [id]',
				],
				workflows: Object.keys(commands),
			})
	}
} catch (failure) {
	console.error(failure.message)
	process.exitCode = 1
}

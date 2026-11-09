import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import crypto from 'node:crypto'
import { spawn, spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { components, prompt } from './protocol.mjs'
import { extractSource } from './generate.mjs'

const hash = (value) => crypto.createHash('sha256').update(value).digest('hex')
const write = (file, value) => fs.writeFileSync(file, JSON.stringify(value, null, 2) + '\n')
const settings = [
	'project_doc_max_bytes=0',
	'memories.use_memories=false',
	'memories.generate_memories=false',
	'features.memories=false',
	'features.shell_tool=false',
	'features.apps=false',
	'features.plugins=false',
	'features.multi_agent=false',
	'features.browser_use=false',
	'features.computer_use=false',
	'features.view_image=false',
	'features.skill_search=false',
	'features.hooks=false',
	'features.workspace_dependencies=false',
	'features.unbounded_connection_retries=false',
	'skills.include_instructions=false',
	'skills.bundled.enabled=false',
	'web_search="disabled"',
	'mcp_servers={}',
	'model_reasoning_effort="medium"',
]

export function containsToolExecution(event) {
	return Boolean(event.item?.type && !['agent_message', 'reasoning'].includes(event.item.type))
}

export function classifyCliResponse(stdout, exitCode, rejectionReason = null) {
	let events
	try {
		events = stdout
			.split('\n')
			.filter(Boolean)
			.map((line) => JSON.parse(line))
	} catch {
		return {
			status: 'invalid-output',
			reason: 'invalid-jsonl',
			answer: '',
			source: null,
			usage: null,
		}
	}
	if (events.some(containsToolExecution)) rejectionReason = 'tool-execution'
	const messages = events.filter(
		(event) => event.type === 'item.completed' && event.item?.type === 'agent_message',
	)
	const candidateMessages = messages.filter(
		(event) => extractSource(event.item.text ?? '') !== null,
	)
	const turns = events.filter((event) => event.type === 'turn.completed')
	const answer = messages.at(-1)?.item.text ?? ''
	const source = extractSource(answer)
	const reason =
		rejectionReason ??
		(exitCode !== 0
			? 'process-failed'
			: turns.length !== 1
				? 'incomplete-turn'
				: candidateMessages.length !== 1 || source === null
					? 'ambiguous-or-missing-source'
					: null)
	return {
		status: reason ? 'invalid-output' : 'generated',
		reason,
		answer,
		source: reason ? null : source,
		usage: turns.at(-1)?.usage ?? null,
		assistantMessages: messages.length,
		candidateMessages: candidateMessages.length,
		completedTurns: turns.length,
	}
}

/** CLI experiments use a fresh home and cwd; the owner's profile is never edited. */
export async function generateCli(cli, directory, models) {
	if (!cli || !directory || models.length !== 2 || models[0] === models[1]) {
		throw new Error('Expected CLI executable, dataset directory, and two distinct model IDs')
	}
	const originalHome = process.env.CODEX_HOME ?? path.join(os.homedir(), '.codex')
	const authFile = path.join(originalHome, 'auth.json')
	const auth = fs.readFileSync(authFile)
	const parsedAuth = JSON.parse(auth)
	if (parsedAuth.auth_mode !== 'chatgpt')
		throw new Error('This route requires existing ChatGPT CLI authentication')
	const secrets = [parsedAuth.OPENAI_API_KEY, ...Object.values(parsedAuth.tokens ?? {})].filter(
		(value) => typeof value === 'string' && value.length > 30,
	)
	const safe = (text) => {
		if (secrets.some((secret) => text.includes(secret)))
			throw new Error('Credential detected; evidence was not saved')
		return text
	}
	const version = spawnSync(cli, ['--version'], { encoding: 'utf8' }).stdout.trim()
	const protocol = {
		schemaVersion: 1,
		route: 'codex-cli-chatgpt-first-response',
		cliVersion: version,
		cliHash: hash(fs.readFileSync(cli)),
		models,
		components,
		settings,
		promptHashes: Object.fromEntries(components.map((id) => [id, hash(prompt(id))])),
		outputBudget: {
			requestedInPrompt: 12000,
			enforcedHardCap: null,
			reason: 'No supported CLI hard output-token cap was established; this is not equivalent to Responses max_output_tokens',
		},
	}
	fs.mkdirSync(directory, { recursive: true })
	const datasetFile = path.join(directory, 'dataset.json')
	if (fs.existsSync(datasetFile)) {
		if (JSON.stringify(JSON.parse(fs.readFileSync(datasetFile))) !== JSON.stringify(protocol))
			throw new Error('Frozen CLI protocol changed; refusing resume')
	} else write(datasetFile, protocol)

	for (const [modelIndex, model] of models.entries())
		for (const component of components) {
			const folder = path.join(directory, `${modelIndex + 1}-${component}`)
			const manifestFile = path.join(folder, 'manifest.json')
			if (
				fs.existsSync(manifestFile) &&
				JSON.parse(fs.readFileSync(manifestFile)).attemptedAt
			)
				continue
			fs.mkdirSync(folder, { recursive: true })
			const scratch = fs.mkdtempSync(path.join(os.tmpdir(), 'ui-model-experiment-'))
			const home = path.join(scratch, 'home'),
				work = path.join(scratch, 'empty')
			fs.mkdirSync(home)
			fs.mkdirSync(work)
			const temporaryAuth = path.join(home, 'auth.json')
			const cleanup = () => {
				if (!fs.existsSync(scratch)) return
				const real = fs.realpathSync(scratch),
					relative = path.relative(fs.realpathSync(os.tmpdir()), real)
				if (
					relative.startsWith('..') ||
					path.isAbsolute(relative) ||
					!/^ui-model-experiment-[A-Za-z0-9]+$/.test(path.basename(real)) ||
					fs.lstatSync(scratch).isSymbolicLink()
				)
					throw new Error('Refusing unsafe scratch cleanup')
				fs.rmSync(temporaryAuth, { force: true })
				fs.rmSync(real, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 })
			}
			process.once('exit', cleanup)
			const env = { ...process.env, CODEX_HOME: home }
			for (const name of Object.keys(env))
				if (
					(name.startsWith('CODEX_') && name !== 'CODEX_HOME') ||
					name.startsWith('VSCODE_') ||
					name === 'OPENAI_API_KEY'
				)
					delete env[name]
			const text = prompt(component)
			const configArgs = settings.flatMap((setting) => ['-c', setting])
			const manifest = {
				schemaVersion: 1,
				component,
				date: new Date().toISOString(),
				requestedModel: model,
				effectiveCliModel: model,
				actualModel: null,
				modelVersionImmutability:
					'CLI does not expose the returned provider model or immutable snapshot; requested catalog alias and client version are recorded',
				route: protocol.route,
				status: 'isolation-preflight',
				promptHash: hash(text),
				sourceHash: null,
				settings: {
					reasoningEffort: 'medium',
					outputBudget: protocol.outputBudget,
					clientConfig: settings,
				},
			}
			try {
				fs.writeFileSync(temporaryAuth, auth, { mode: 0o600 })
				const preview = spawnSync(
					cli,
					[
						'--no-daemon',
						'-C',
						work,
						'-c',
						`model="${model}"`,
						...configArgs,
						'debug',
						'prompt-input',
						text,
					],
					{
						cwd: work,
						env,
						encoding: 'utf8',
						timeout: 30000,
						maxBuffer: 8 * 1024 * 1024,
					},
				)
				if (preview.status !== 0) {
					fs.writeFileSync(
						path.join(folder, 'preflight-diagnostics.txt'),
						safe(preview.stderr ?? ''),
					)
					throw new Error('CLI prompt preflight failed')
				}
				const input = JSON.parse(preview.stdout)
				if (
					/(?:memory-ai|soldy|soxa|MEMORY_SUMMARY|youra-h|[Dd]:[\\/]projects)/i.test(
						preview.stdout,
					)
				)
					throw new Error('Repository or owner context present in CLI prompt')
				manifest.isolation = {
					emptyWorkingDirectory: true,
					freshClientHome: true,
					ownerConfigUnchanged: true,
					memoriesAndSkillsDisabled: true,
					preflightRenderedPromptHash: hash(preview.stdout),
					providerRequest:
						'Not exposed by CLI; this hash is a preflight, not an exact provider request',
					renderedItems: input.map((item) => ({ type: item.type, role: item.role })),
					declaredTools: input
						.filter((item) => item.type === 'additional_tools')
						.flatMap((item) => item.tools.map((tool) => tool.name)),
					toolPolicy:
						'Generic client tools remain declared. Any tool execution invalidates the sample and terminates the run. No repository instructions or files are supplied.',
				}
				fs.writeFileSync(path.join(folder, 'prompt.txt'), text)
				manifest.status = 'attempted'
				manifest.attemptedAt = new Date().toISOString()
				write(manifestFile, manifest)
				const args = [
					'--no-daemon',
					'-a',
					'never',
					'exec',
					'--ignore-user-config',
					'--ignore-rules',
					'--ephemeral',
					'--skip-git-repo-check',
					'--json',
					'-s',
					'read-only',
					'-C',
					work,
					'-m',
					model,
					...configArgs,
					text,
				]
				write(path.join(folder, 'invocation.json'), {
					executable: 'codex',
					cliVersion: version,
					args: args.map((arg) =>
						arg === work
							? '<empty-working-directory>'
							: arg === text
								? '<exact-prompt.txt>'
								: arg,
					),
					environment: {
						CODEX_HOME: '<private-ephemeral-home>',
						credentialSource:
							'Existing ChatGPT login; temporary auth file removed after invocation',
						inheritedIdeSessionVariables: false,
					},
				})
				console.log(`${new Date().toISOString()} START ${model}/${component}`)
				let stdout = '',
					stderr = '',
					pending = '',
					rejectionReason = null
				const result = await new Promise((resolve, reject) => {
					const child = spawn(cli, args, {
						cwd: work,
						env,
						stdio: ['ignore', 'pipe', 'pipe'],
					})
					const timer = setTimeout(
						() => {
							rejectionReason = 'timeout'
							child.kill()
						},
						10 * 60 * 1000,
					)
					child.stdout.setEncoding('utf8')
					child.stderr.setEncoding('utf8')
					child.stdout.on('data', (chunk) => {
						stdout += chunk
						pending += chunk
						const lines = pending.split('\n')
						pending = lines.pop()
						for (const line of lines.filter(Boolean)) {
							try {
								if (containsToolExecution(JSON.parse(line))) {
									rejectionReason = 'tool-execution'
									child.kill()
								}
							} catch {
								rejectionReason = 'invalid-jsonl'
								child.kill()
							}
						}
					})
					child.stderr.on('data', (chunk) => {
						stderr += chunk
					})
					child.once('error', (error) => {
						clearTimeout(timer)
						reject(error)
					})
					child.once('exit', (code, signal) => {
						clearTimeout(timer)
						resolve({ code, signal })
					})
				})
				fs.writeFileSync(path.join(folder, 'events.jsonl'), safe(stdout))
				fs.writeFileSync(path.join(folder, 'diagnostics.txt'), safe(stderr))
				const classified = classifyCliResponse(stdout, result.code, rejectionReason)
				const { answer, source } = classified
				fs.writeFileSync(path.join(folder, 'answer.txt'), safe(answer))
				manifest.status = classified.status
				Object.assign(manifest, {
					finished: new Date().toISOString(),
					exitCode: result.code,
					signal: result.signal,
					rejectionReason: classified.reason,
					toolExecutionRejected: classified.reason === 'tool-execution',
					usage: classified.usage,
					eventHash: hash(stdout),
					answerHash: hash(answer),
					sourceHash: source !== null ? hash(source) : null,
					extraction: 'Exact bytes inside sole fenced vue block; no repairs',
					assistantMessages: classified.assistantMessages,
					candidateMessages: classified.candidateMessages,
					completedTurns: classified.completedTurns,
				})
				if (source !== null) fs.writeFileSync(path.join(folder, 'Candidate.vue'), source)
				write(manifestFile, manifest)
				console.log(
					`${new Date().toISOString()} END ${model}/${component} ${manifest.status}`,
				)
				if (manifest.status !== 'generated')
					throw new Error(
						'First response incomplete or tools were used; no retry performed',
					)
			} catch (error) {
				if (manifest.status === 'attempted' || manifest.status === 'isolation-preflight') {
					manifest.status = 'generation-failed'
					manifest.reason = safe(error.message)
					write(manifestFile, manifest)
				}
				throw error
			} finally {
				cleanup()
				process.removeListener('exit', cleanup)
			}
		}
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
	const [cli, directory, ...models] = process.argv.slice(2)
	await generateCli(cli, directory, models)
}

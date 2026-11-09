import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { components, prompt } from './protocol.mjs'

const hash = (text) => crypto.createHash('sha256').update(text).digest('hex')
const write = (file, value) => fs.writeFileSync(file, JSON.stringify(value, null, '\t') + '\n')
export function extractSource(answer) {
	const fenced = [...answer.matchAll(/^```vue[\t ]*\r?\n([\s\S]*?)^```[\t ]*(?:\r?\n|$)/gm)]
	return fenced.length === 1 ? fenced[0][1] : null
}

/** Attempts each cell once. Resume only fills cells that were never attempted. */
export async function generate(
	directory,
	models,
	{ credential = process.env.OPENAI_API_KEY, request = fetch } = {},
) {
	if (!directory || models.length !== 2 || models[0] === models[1])
		throw new Error('Expected output directory and two distinct model IDs')
	if (!credential) throw new Error('Missing generation credential; no samples created')
	fs.mkdirSync(directory, { recursive: true })
	const datasetFile = path.join(directory, 'dataset.json')
	const dataset = {
		schemaVersion: 1,
		models,
		components,
		promptHashes: Object.fromEntries(components.map((id) => [id, hash(prompt(id))])),
	}
	if (fs.existsSync(datasetFile)) {
		if (JSON.stringify(JSON.parse(fs.readFileSync(datasetFile))) !== JSON.stringify(dataset))
			throw new Error('Protocol/models changed; this dataset cannot be resumed')
	} else write(datasetFile, dataset)
	for (const model of models)
		for (const component of components) {
			const folder = path.join(directory, `${models.indexOf(model) + 1}-${component}`)
			const manifestFile = path.join(folder, 'manifest.json')
			if (fs.existsSync(manifestFile)) continue
			fs.mkdirSync(folder, { recursive: true })
			const text = prompt(component)
			const body = { model, input: text, max_output_tokens: 12000, store: false }
			fs.writeFileSync(path.join(folder, 'prompt.txt'), text)
			write(path.join(folder, 'request.json'), body)
			const manifest = {
				schemaVersion: 1,
				component,
				date: new Date().toISOString(),
				requestedModel: model,
				status: 'attempted',
				promptHash: hash(text),
				sourceHash: null,
				settings: {
					max_output_tokens: 12000,
					store: false,
					other: 'provider defaults; budget includes reasoning and visible tokens',
				},
				isolation:
					'Single API request; no repo context, tools, history, retries or corrective dialog',
			}
			write(manifestFile, manifest)
			try {
				const response = await request('https://api.openai.com/v1/responses', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${credential}`,
					},
					body: JSON.stringify(body),
				})
				if (!response.ok) {
					manifest.status = 'generation-failed'
					manifest.httpStatus = response.status
					write(manifestFile, manifest)
					throw new Error(
						`Generation HTTP ${response.status}; credential and error response body are not recorded`,
					)
				}
				const exact = await response.text()
				fs.writeFileSync(path.join(folder, 'response.json'), exact)
				manifest.responseHash = hash(exact)
				const result = JSON.parse(exact)
				const answer =
					result.output
						?.flatMap((item) => item.content ?? [])
						.filter((item) => item.type === 'output_text')
						.map((item) => item.text)
						.join('') ?? ''
				fs.writeFileSync(path.join(folder, 'answer.txt'), answer)
				const source = extractSource(answer)
				if (source !== null) fs.writeFileSync(path.join(folder, 'Candidate.vue'), source)
				Object.assign(manifest, {
					actualModel: result.model,
					modelVersionImmutability:
						'Unknown unless a provider documents the returned ID as an immutable snapshot',
					returnedSettings: {
						reasoning: result.reasoning,
						temperature: result.temperature,
						top_p: result.top_p,
						text: result.text,
						service_tier: result.service_tier,
					},
					responseId: result.id,
					status:
						result.status === 'completed' && source !== null
							? 'generated'
							: 'invalid-output',
					providerStatus: result.status,
					incompleteDetails: result.incomplete_details,
					usage: result.usage,
					answerHash: hash(answer),
					sourceHash: source !== null ? hash(source) : null,
					extraction:
						source !== null
							? 'Exact bytes inside sole fenced vue block; no repairs'
							: 'No sole vue block: compile-failed input',
				})
				write(manifestFile, manifest)
			} catch {
				if (manifest.status === 'attempted') {
					manifest.status = 'generation-failed'
					manifest.reason =
						'Transport/parse failure; diagnostic omitted to avoid credential exposure'
					write(manifestFile, manifest)
				}
				throw new Error(
					`Generation failed for ${component}; inspect the credential-free attempt manifest. First response will not be retried.`,
				)
			}
		}
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
	const [directory, ...models] = process.argv.slice(2)
	await generate(directory, models)
}

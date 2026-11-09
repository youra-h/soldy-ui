import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { components, prompt } from '../protocol.mjs'
import { generate, extractSource } from '../generate.mjs'

test('all five prompts share the fixed environment and output budget', () => {
	for (const component of components) {
		const text = prompt(component)
		assert.match(text, /12000 tokens/)
		assert.match(text, /360px/)
		assert.match(text, /SSR/)
		assert.match(text, /no repository context|repository context/i)
	}
})
test('source extraction preserves leading blank lines, CRLF and inline backticks', () => {
	const source =
		'\r\n<script setup>\r\nconst text = "inline ``` marker"\r\n</script>\r\n<template><p>{{ text }}</p></template>\r\n'
	assert.equal(extractSource('```vue \r\n' + source + '```\r\n'), source)
	assert.equal(extractSource('```vue\n<a/>\n```\n```vue\n<b/>\n```\n'), null)
})
test('first responses are immutable and resumable without reroll or credential output', async () => {
	const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'soxa-ai-test-'))
	let calls = 0
	const request = async () => {
		calls++
		if (calls === 2) return new Response('secret-value', { status: 401 })
		return new Response(
			JSON.stringify({
				model: 'returned-model',
				id: 'fixture',
				status: 'completed',
				usage: { output_tokens: 4 },
				output: [
					{
						type: 'message',
						content: [
							{
								type: 'output_text',
								text: '```vue\n<template><div>Fixture only</div></template>\n```',
							},
						],
					},
				],
			}),
		)
	}
	try {
		await assert.rejects(
			generate(directory, ['a', 'b'], { credential: 'secret-value', request }),
			/Generation failed/,
		)
		assert.equal(calls, 2)
		assert.equal(
			JSON.parse(fs.readFileSync(path.join(directory, '1-select/manifest.json'))).status,
			'generated',
		)
		assert.equal(
			JSON.parse(fs.readFileSync(path.join(directory, '1-date-picker/manifest.json')))
				.httpStatus,
			401,
		)
		await generate(directory, ['a', 'b'], { credential: 'secret-value', request })
		assert.equal(
			calls,
			10,
			'resume fills 8 never attempted cells, including neither of the first two',
		)
		const files = fs
			.readdirSync(directory, { recursive: true })
			.filter((name) => fs.statSync(path.join(directory, name)).isFile())
		assert(
			files.every(
				(name) =>
					!fs.readFileSync(path.join(directory, name), 'utf8').includes('secret-value'),
			),
		)
		assert.equal(
			fs.readFileSync(path.join(directory, '1-select/Candidate.vue'), 'utf8'),
			'<template><div>Fixture only</div></template>\n',
		)
	} finally {
		const real = fs.realpathSync(directory)
		assert.equal(path.dirname(real), fs.realpathSync(os.tmpdir()))
		assert(path.basename(real).startsWith('soxa-ai-test-'))
		fs.rmSync(real, { recursive: true, force: true })
	}
})

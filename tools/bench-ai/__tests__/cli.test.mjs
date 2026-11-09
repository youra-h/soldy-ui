import assert from 'node:assert/strict'
import test from 'node:test'
import { classifyCliResponse } from '../generate-cli.mjs'

const message = (text) => ({ type: 'item.completed', item: { type: 'agent_message', text } })
const completed = { type: 'turn.completed', usage: { output_tokens: 15 } }
const answer = '```vue\r\n\r\n<template><button>Example</button></template>\r\n```'
const stream = (...events) => events.map((event) => JSON.stringify(event)).join('\n')

test('preserves the sole source and leading CRLF bytes from one completed turn', () => {
	const result = classifyCliResponse(stream(message(answer), completed), 0)
	assert.equal(result.status, 'generated')
	assert.equal(result.source, '\r\n<template><button>Example</button></template>\r\n')
})

test('rejects a tool item on the last JSONL line without a trailing newline', () => {
	const result = classifyCliResponse(
		stream(message(answer), completed, {
			type: 'item.started',
			item: { type: 'command_execution', command: 'read-project' },
		}),
		0,
	)
	assert.equal(result.reason, 'tool-execution')
	assert.equal(result.source, null)
})

test('does not choose between multiple candidate-bearing messages', () => {
	const result = classifyCliResponse(stream(message(answer), message(answer), completed), 0)
	assert.equal(result.reason, 'ambiguous-or-missing-source')
	assert.equal(result.source, null)
})

test('does not accept a source from an unsuccessful or unfinished process', () => {
	assert.equal(classifyCliResponse(stream(message(answer), completed), 1).source, null)
	assert.equal(classifyCliResponse(stream(message(answer)), 0).source, null)
})

test('keeps timeout and malformed JSON distinct from tool execution', () => {
	assert.equal(
		classifyCliResponse(stream(message(answer), completed), 0, 'timeout').reason,
		'timeout',
	)
	assert.equal(classifyCliResponse('{', 0).reason, 'invalid-jsonl')
})

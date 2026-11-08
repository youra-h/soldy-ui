#!/usr/bin/env node
/** Newline-delimited stdio MCP; mutations are processed in request order. */
import { createInterface } from 'node:readline'
import { callTool, listTools } from './protocol.mjs'

const send = (message) => process.stdout.write(JSON.stringify(message) + '\n')
const reply = (id, result) => send({ jsonrpc: '2.0', id, result })
const error = (id, code, message) => send({ jsonrpc: '2.0', id, error: { code, message } })

async function handle(message) {
	if (!message || message.jsonrpc !== '2.0' || typeof message.method !== 'string')
		return error(message?.id ?? null, -32600, 'Invalid JSON-RPC request')
	if (message.id === undefined) return
	const { id, method, params } = message
	switch (method) {
		case 'initialize':
			return reply(id, {
				protocolVersion: params?.protocolVersion ?? '2025-06-18',
				capabilities: { tools: {} },
				serverInfo: { name: 'soxa-clickup', version: '0.2.0' },
			})
		case 'ping':
			return reply(id, {})
		case 'tools/list':
			return reply(id, { tools: listTools() })
		case 'tools/call': {
			try {
				const result = await callTool(params?.name, params?.arguments ?? {})
				return reply(id, { content: [{ type: 'text', text: JSON.stringify(result) }] })
			} catch (failure) {
				return reply(id, {
					isError: true,
					content: [{ type: 'text', text: String(failure.message ?? failure) }],
				})
			}
		}
		default:
			return error(id, -32601, `Unsupported method: ${method}`)
	}
}

let queue = Promise.resolve()
for await (const line of createInterface({ input: process.stdin, crlfDelay: Infinity })) {
	if (!line.trim()) continue
	queue = queue
		.then(async () => {
			let message
			try {
				message = JSON.parse(line)
			} catch {
				error(null, -32700, 'Invalid JSON')
				return
			}
			await handle(message)
		})
		.catch((failure) => process.stderr.write(`ClickUp MCP: ${failure.message}\n`))
}
await queue

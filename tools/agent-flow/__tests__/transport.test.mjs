import { test } from 'node:test'
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

test('stdio stays valid JSON-RPC across notifications, malformed frames and tool errors', () => {
	const frames = [
		{ jsonrpc: '2.0', id: 1, method: 'initialize', params: { protocolVersion: '2025-06-18' } },
		{ jsonrpc: '2.0', method: 'notifications/initialized' },
		{ jsonrpc: '2.0', id: 2, method: 'tools/list' },
		{ jsonrpc: '2.0', id: 3, method: 'unknown-method' },
		{
			jsonrpc: '2.0',
			id: 4,
			method: 'tools/call',
			params: { name: 'clickup_take', arguments: { task_id: 'a', role: 'manager' } },
		},
		{ jsonrpc: '2.0', id: 5, method: 'ping' },
	]
	const child = spawnSync(
		process.execPath,
		[fileURLToPath(new URL('../clickup-mcp.mjs', import.meta.url))],
		{
			input:
				frames.map((frame) => JSON.stringify(frame)).join('\r\n') + '\r\ninvalid-json\r\n',
			encoding: 'utf8',
			timeout: 10000,
		},
	)
	assert.equal(child.status, 0, child.stderr)
	const output = child.stdout
		.trim()
		.split('\n')
		.map((line) => JSON.parse(line))
	assert.equal(output.length, 6)
	assert.equal(output[0].result.protocolVersion, '2025-06-18')
	assert.equal(output[1].result.tools.length, 11)
	assert.equal(output[2].error.code, -32601)
	assert.equal(output[3].result.isError, true)
	assert.equal(output[4].id, 5)
	assert.equal(output[5].error.code, -32700)
})

test('Git commit guard accepts English and rejects Cyrillic and obsolete attribution', (t) => {
	const directory = mkdtempSync(join(tmpdir(), 'soxa-commit-'))
	t.after(() => rmSync(directory, { recursive: true, force: true }))
	const message = join(directory, 'message')
	const guard = fileURLToPath(new URL('../check-commit.mjs', import.meta.url))
	for (const [text, expected] of [
		['Fix task queue ordering\n', 0],
		['\u0418\u0441\u043f\u0440\u0430\u0432\u0438\u0442\u044c', 1],
		['Fix queue\n\nCo-Authored-By: Claude <noreply@anthropic.com>\n', 1],
	]) {
		writeFileSync(message, text)
		assert.equal(
			spawnSync(process.execPath, [guard, message], { encoding: 'utf8' }).status,
			expected,
		)
	}
})

import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { execFileSync, spawnSync } from 'node:child_process'

test('bounds raw evidence diff while checking every supported syntax at all path depths', () => {
	const temporaryRoot = fs.realpathSync(os.tmpdir())
	const directory = fs.mkdtempSync(path.join(temporaryRoot, 'soxa-comments-'))
	const scanner = path.join(import.meta.dirname, 'comments.mjs')
	const extensions = [
		'ts',
		'tsx',
		'mts',
		'cts',
		'js',
		'jsx',
		'mjs',
		'cjs',
		'scss',
		'css',
		'vue',
		'svelte',
		'html',
		'yml',
		'yaml',
	]
	const sources = extensions
		.flatMap((extension) => ['root.' + extension, 'nested/child.' + extension])
		.concat('.github/workflows/guard.yml')
	const git = (...args) =>
		execFileSync(
			'git',
			[
				'-c',
				'core.hooksPath=' + path.join(directory, 'no-hooks'),
				'-c',
				'user.name=Guard test',
				'-c',
				'user.email=guard@example.invalid',
				...args,
			],
			{ cwd: directory, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] },
		)
	const comment = (file, text) =>
		/\.(yml|yaml)$/.test(file)
			? '# ' + text
			: /\.(css|scss)$/.test(file)
				? '/* ' + text + ' */'
				: /\.(vue|svelte|html)$/.test(file)
					? '<!-- ' + text + ' -->'
					: '// ' + text
	const write = (text) => {
		for (const file of sources) {
			const target = path.join(directory, file)
			fs.mkdirSync(path.dirname(target), { recursive: true })
			fs.writeFileSync(target, comment(file, text) + '\n')
		}
	}
	// A small deterministic subprocess budget exposes accidental raw-JSON buffering.
	const preload =
		"import cp from 'node:child_process';import {syncBuiltinESMExports} from 'node:module';const original=cp.execFileSync;cp.execFileSync=function(file,args,options){return original(file,args,args?.[0]==='diff'?{...options,maxBuffer:32768}:options)};syncBuiltinESMExports()"
	const run = (base) =>
		spawnSync(
			process.execPath,
			['--import', 'data:text/javascript,' + encodeURIComponent(preload), scanner, base],
			{ cwd: directory, encoding: 'utf8', maxBuffer: 1 << 20 },
		)
	try {
		git('init', '--initial-branch=main')
		git('commit', '--allow-empty', '-m', 'Base')
		const base = git('rev-parse', 'HEAD').trim()
		write('English')
		fs.writeFileSync(
			path.join(directory, 'raw.json'),
			JSON.stringify({ evidence: 'x'.repeat(1 << 20) }),
		)
		git('add', '.')
		git('commit', '-m', 'English fixtures and raw evidence')
		const good = run(base)
		assert.equal(good.status, 0, good.stderr)
		write('\u043d\u043e\u0432\u043e\u0435')
		git('add', '.')
		git('commit', '-m', 'Forbidden comment fixtures')
		const bad = run(base)
		assert.equal(bad.status, 1, bad.stderr)
		for (const source of sources)
			assert.ok(bad.stderr.includes(source + ':1:'), source + ' was not checked')
		assert.equal((bad.stderr.match(/:1:/g) ?? []).length, sources.length)
	} finally {
		assert.equal(path.dirname(fs.realpathSync(directory)), temporaryRoot)
		fs.rmSync(directory, { recursive: true, force: true })
	}
})

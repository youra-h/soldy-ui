import { describe, it, expect } from 'vitest'
import {
	libraryClosure,
	libraryLines,
	libraryNamesOf,
	lockProblems,
	withRegistry,
	withTarballs,
} from '../install-smoke.ts'
import type { TManifest } from '../install-smoke.ts'

/**
 * The rules of the install run on fixtures (docs/agents/build.md, «Прогон
 * установки»): which library packages a project installs and from where, what
 * a project's lock may hold, which lines of a tool's output are about the
 * library. A rule that let a package of the registry or a second copy through
 * would make the run green for nothing.
 */

/** The library of the fixtures: an adapter over the core, a theme with a peer on it. */
const LIBRARY = new Map<string, TManifest>([
	['@soxa-ui/core', { name: '@soxa-ui/core' }],
	['@soxa-ui/plugins', { name: '@soxa-ui/plugins', dependencies: { '@soxa-ui/core': '1.0.0' } }],
	[
		'@soxa-ui/setup',
		{
			name: '@soxa-ui/setup',
			dependencies: { '@soxa-ui/core': '1.0.0', '@soxa-ui/plugins': '1.0.0' },
		},
	],
	[
		'@soxa-ui/vue',
		{
			name: '@soxa-ui/vue',
			dependencies: { '@soxa-ui/setup': '1.0.0' },
			peerDependencies: { vue: '^3.5.0' },
		},
	],
	['@soxa-ui/theme-base', { name: '@soxa-ui/theme-base' }],
	[
		'@soxa-ui/theme-oren',
		{
			name: '@soxa-ui/theme-oren',
			dependencies: { '@soxa-ui/theme-base': '1.0.0' },
			peerDependencies: { '@soxa-ui/core': '1.0.0' },
		},
	],
])

/** A project as it lies in `projects/`: the library under the placeholder `*`. */
const PROJECT: TManifest = {
	name: 'app',
	dependencies: { vue: '^3.5.44', '@soxa-ui/vue': '*' },
	devDependencies: { vite: '^8.3.5', '@soxa-ui/theme-oren': '*' },
}

describe('библиотека проекта', () => {
	it('пакеты библиотеки, которые проект называет сам, — из обоих полей', () => {
		expect(libraryNamesOf(PROJECT)).toEqual(['@soxa-ui/theme-oren', '@soxa-ui/vue'])
	})

	it('замыкание — по dependencies и peerDependencies, вглубь, без чужих пакетов', () => {
		expect(libraryClosure(['@soxa-ui/vue', '@soxa-ui/theme-oren'], LIBRARY)).toEqual([
			'@soxa-ui/core',
			'@soxa-ui/plugins',
			'@soxa-ui/setup',
			'@soxa-ui/theme-base',
			'@soxa-ui/theme-oren',
			'@soxa-ui/vue',
		])
	})

	// Otherwise npm would take the package from the registry
	it('пакет библиотеки, которого нет в воркспейсе, — ошибка', () => {
		expect(() => libraryClosure(['@soxa-ui/svelte'], LIBRARY)).toThrow('@soxa-ui/svelte')
	})
})

describe('манифест проекта', () => {
	const closure = libraryClosure(libraryNamesOf(PROJECT), LIBRARY)
	const specs = new Map(
		closure.map((name) => [name, `file:../tarballs/${name.slice('@soxa-ui/'.length)}.tgz`]),
	)

	it('из тарболлов: названные пакеты — на свой тарболл, остальные замыкания — в dependencies', () => {
		expect(withTarballs(PROJECT, specs)).toEqual({
			name: 'app',
			dependencies: {
				vue: '^3.5.44',
				'@soxa-ui/vue': 'file:../tarballs/vue.tgz',
				'@soxa-ui/core': 'file:../tarballs/core.tgz',
				'@soxa-ui/plugins': 'file:../tarballs/plugins.tgz',
				'@soxa-ui/setup': 'file:../tarballs/setup.tgz',
				'@soxa-ui/theme-base': 'file:../tarballs/theme-base.tgz',
			},
			devDependencies: {
				vite: '^8.3.5',
				'@soxa-ui/theme-oren': 'file:../tarballs/theme-oren.tgz',
			},
		})
	})

	it('из реестра: названные пакеты — под версией или тегом, остальное ставит npm', () => {
		expect(withRegistry(PROJECT, 'latest')).toEqual({
			name: 'app',
			dependencies: { vue: '^3.5.44', '@soxa-ui/vue': 'latest' },
			devDependencies: { vite: '^8.3.5', '@soxa-ui/theme-oren': 'latest' },
		})
	})
})

describe('библиотека в lock проекта', () => {
	const closure = ['@soxa-ui/core', '@soxa-ui/vue']
	const fromTarball = (name: string, resolved: string | undefined): boolean =>
		resolved === `file:../tarballs/${name.slice('@soxa-ui/'.length)}.tgz`

	/** A lock with these entries of `packages`. */
	const lock = (packages: Readonly<Record<string, TManifest>>): TManifest => ({
		lockfileVersion: 3,
		packages: { '': { name: 'app' }, 'node_modules/vue': { version: '3.5.44' }, ...packages },
	})

	it('каждый пакет — один раз, наверху и из тарболла: без нарушений', () => {
		const entries = {
			'node_modules/@soxa-ui/core': { resolved: 'file:../tarballs/core.tgz' },
			'node_modules/@soxa-ui/vue': { resolved: 'file:../tarballs/vue.tgz' },
		}

		expect(lockProblems(lock(entries), closure, fromTarball)).toEqual([])
	})

	it('вторая копия, пакет не из тарболла и непоставленный пакет — нарушения', () => {
		const entries = {
			'node_modules/@soxa-ui/core': {
				resolved: 'https://registry.npmjs.org/@soxa-ui/core/-/core-1.0.0.tgz',
			},
			'node_modules/@soxa-ui/theme-oren/node_modules/@soxa-ui/core': {
				resolved: 'file:../tarballs/core.tgz',
			},
		}

		expect(lockProblems(lock(entries), closure, fromTarball)).toEqual([
			'@soxa-ui/core: поставлен не оттуда — https://registry.npmjs.org/@soxa-ui/core/-/core-1.0.0.tgz',
			'@soxa-ui/core: вторая копия в node_modules/@soxa-ui/theme-oren/node_modules/@soxa-ui/core',
			'@soxa-ui/vue: не поставлен',
		])
	})
})

describe('строки вывода о библиотеке', () => {
	it('модуль внутри поставленного пакета и предупреждение с именем пакета — о библиотеке', () => {
		const output = [
			'✓ 1077 modules transformed.',
			'[vite-plugin-svelte] node_modules/@soxa-ui/svelte/dist/components/Button.svelte:3:1 Unused CSS',
			'npm warn ERESOLVE overriding peer dependency @soxa-ui/core@1.0.0',
			'node_modules\\@soxa-ui\\react\\dist\\index.js (1:0): Module level directives cause errors',
		].join('\n')

		expect(libraryLines(output)).toEqual([
			'[vite-plugin-svelte] node_modules/@soxa-ui/svelte/dist/components/Button.svelte:3:1 Unused CSS',
			'npm warn ERESOLVE overriding peer dependency @soxa-ui/core@1.0.0',
			'node_modules\\@soxa-ui\\react\\dist\\index.js (1:0): Module level directives cause errors',
		])
	})

	// Nitro names the chunks of the server after the packages in them
	it('файл сборки, названный по пакету, — не о библиотеке', () => {
		expect(
			libraryLines('.output/server/_libs/@soxa-ui/core.mjs   813.05 kB │ gzip: 207.05 kB'),
		).toEqual([])
	})

	it('цвета терминала снимаются', () => {
		const escape = String.fromCharCode(27)

		expect(libraryLines(`${escape}[33mnpm warn${escape}[39m peer @soxa-ui/core@1.0.0`)).toEqual(
			['npm warn peer @soxa-ui/core@1.0.0'],
		)
	})
})

import { beforeAll, describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import ts from 'typescript'
import expected from './exports.json'

const root = resolve(import.meta.dirname, '../..')
type TExports = { values: string[]; types: string[] }

/** Check module exports without evaluating custom-element registration or framework hooks. */
function exportsOf(program: ts.Program, file: string): TExports {
	const checker = program.getTypeChecker()
	const source = program.getSourceFile(file)
	if (!source) throw new Error(`Missing API entry: ${file}`)
	const symbol = checker.getSymbolAtLocation(source)
	if (!symbol) throw new Error(`Not a module: ${file}`)
	const result: TExports = { values: [], types: [] }
	for (const name of checker.getExportsOfModule(symbol)) {
		const typeOnly = name.declarations?.some(
			(declaration) =>
				ts.isExportSpecifier(declaration) &&
				(declaration.isTypeOnly ||
					(ts.isExportDeclaration(declaration.parent.parent) &&
						declaration.parent.parent.isTypeOnly)),
		)
		const target = name.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(name) : name
		const kind = !typeOnly && target.flags & ts.SymbolFlags.Value ? 'values' : 'types'
		result[kind].push(name.name)
	}
	result.values.sort()
	result.types.sort()
	return result
}

for (const [adapter, contract] of Object.entries(expected)) {
	describe(adapter, () => {
		const directory = resolve(root, 'packages/ui', adapter)
		const config = ts.readConfigFile(resolve(directory, 'tsconfig.json'), ts.sys.readFile)
		const options = ts.parseJsonConfigFileContent(config.config, ts.sys, directory).options
		const manifest = JSON.parse(readFileSync(resolve(directory, 'package.json'), 'utf8'))
		// Angular's root manifest uses main/types; ng-packagr owns the bundled entry.
		const publishedEntries = manifest.exports ?? {
			'.': { types: manifest.types, default: manifest.main },
		}
		const entries: Record<string, TExports> = {
			'.': { values: contract.values, types: contract.types },
			...('subpaths' in contract ? contract.subpaths : {}),
		}
		const targets = Object.keys(entries).map((entry) => publishedEntries[entry])
		const sources = Object.keys(entries).map((entry) =>
			entry === '.'
				? resolve(directory, 'src/index.ts')
				: resolve(
						directory,
						publishedEntries[entry].types
							.replace('./dist/', 'src/')
							.replace(/\.d\.ts$/, '.ts'),
					),
		)
		let sourceProgram: ts.Program
		let declarationProgram: ts.Program
		let javascriptProgram: ts.Program
		beforeAll(() => {
			sourceProgram = ts.createProgram(sources, { ...options, noEmit: true })
			declarationProgram = ts.createProgram(
				targets.map((target) => resolve(directory, target.types)),
				{ ...options, paths: {}, noEmit: true },
			)
			javascriptProgram = ts.createProgram(
				targets.map((target) => resolve(directory, target.default)),
				{ ...options, paths: {}, noEmit: true, allowJs: true },
			)
		}, 30_000)
		it('publishes exactly the supported entry points', () => {
			expect(Object.keys(publishedEntries).sort()).toEqual(Object.keys(entries).sort())
		})
		for (const [entry, names] of Object.entries(entries)) {
			const target = publishedEntries[entry]
			it(entry + ' keeps the source API explicit', () => {
				const file =
					entry === '.'
						? resolve(directory, 'src/index.ts')
						: resolve(
								directory,
								target.types.replace('./dist/', 'src/').replace(/\.d\.ts$/, '.ts'),
							)
				expect(exportsOf(sourceProgram, file)).toEqual(names)
			})
			it(entry + ' publishes the same values and types in declarations', () => {
				// Use the published declarations with package resolution, without workspace source aliases.
				expect(exportsOf(declarationProgram, resolve(directory, target.types))).toEqual(
					names,
				)
			})
			it(entry + ' publishes only the supported JavaScript exports', () => {
				const actual = exportsOf(javascriptProgram, resolve(directory, target.default))
				expect([...actual.values, ...actual.types].sort()).toEqual(names.values)
			})
		}
	})
}

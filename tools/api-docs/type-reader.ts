import { resolve } from 'node:path'
import ts from 'typescript'
import { frameworks } from './frameworks'
import { root, sourcePath } from './discover'
import type { TContractTypes, TFramework, TMemberType } from './types'

/** Runtime constructors erase generics and literal unions; use the adapter's inferred contracts. */
export class TypeReader {
	private readonly _checker: ts.TypeChecker
	private readonly _source: ts.SourceFile
	private readonly _aliases = new Map<string, ts.Type>()
	private readonly _program: ts.Program

	constructor(descriptors: readonly string[], plugins: readonly string[]) {
		const file = resolve(root, 'tools/api-docs/__contracts__.ts')
		const aliases = [
			`import type * as Setup from '@soxa-ui/setup'`,
			...descriptors.flatMap((name) => [
				`type ${name}Props = Setup.DescriptorComponentProps<typeof Setup.${name}>`,
				`type ${name}Events = Setup.DescriptorAllEvents<typeof Setup.${name}>`,
				`type ${name}Slots = Setup.DescriptorSlots<typeof Setup.${name}>`,
				`type ${name}Instance = Setup.DescriptorInstance<typeof Setup.${name}>`,
			]),
			...plugins.flatMap((name) => [
				`type ${name}Props = NonNullable<(typeof Setup.${name})['__contract']>['props']`,
				`type ${name}Events = NonNullable<(typeof Setup.${name})['__contract']>['events']`,
			]),
		].join('\n')
		const configFile = resolve(root, 'packages/setup/tsconfig.json')
		const config = ts.readConfigFile(configFile, ts.sys.readFile)
		if (config.error)
			throw new Error(ts.flattenDiagnosticMessageText(config.error.messageText, '\n'))
		const { options } = ts.parseJsonConfigFileContent(
			config.config,
			ts.sys,
			resolve(configFile, '..'),
		)
		const host = ts.createCompilerHost(options)
		const getSourceFile = host.getSourceFile.bind(host)
		host.getSourceFile = (path, languageVersion, onError, shouldCreateNewSourceFile) =>
			resolve(path) === file
				? ts.createSourceFile(file, aliases, ts.ScriptTarget.Latest, true)
				: getSourceFile(path, languageVersion, onError, shouldCreateNewSourceFile)
		host.fileExists = (
			(original) => (path) =>
				resolve(path) === file || original(path)
		)(host.fileExists.bind(host))
		this._program = ts.createProgram(
			[
				file,
				...Object.keys(frameworks).map((name) =>
					resolve(root, `packages/ui/${name}/src/index.ts`),
				),
			],
			options,
			host,
		)
		const source = this._program.getSourceFile(file)
		if (!source) throw new Error('Missing documentation type module')
		this._source = source
		this._checker = this._program.getTypeChecker()
		const diagnostics = this._program.getSemanticDiagnostics(source)
		if (diagnostics.length)
			throw new Error(
				ts.formatDiagnosticsWithColorAndContext(diagnostics, {
					getCurrentDirectory: () => root,
					getCanonicalFileName: (file) => file,
					getNewLine: () => '\n',
				}),
			)

		for (const statement of source.statements) {
			if (ts.isTypeAliasDeclaration(statement))
				this._aliases.set(
					statement.name.text,
					this._checker.getTypeFromTypeNode(statement.type),
				)
		}
	}

	private _members(type: ts.Type): Map<string, TMemberType> {
		return new Map(
			this._checker.getPropertiesOfType(type).map((symbol) => {
				const memberType = this._checker.getTypeOfSymbolAtLocation(symbol, this._source)
				const description = ts.displayPartsToString(
					symbol.getDocumentationComment(this._checker),
				)
				const declaration = symbol.declarations?.find(
					(node) =>
						ts.isPropertySignature(node) ||
						ts.isPropertyDeclaration(node) ||
						ts.isGetAccessorDeclaration(node),
				)
				const declaredType =
					declaration &&
					(ts.isPropertySignature(declaration) ||
						ts.isPropertyDeclaration(declaration) ||
						ts.isGetAccessorDeclaration(declaration))
						? declaration.type?.getText().replace(/\r\n/g, '\n')
						: undefined
				const values = (memberType.isUnion() ? memberType.types : [memberType]).flatMap(
					(type) =>
						type.isStringLiteral() || type.isNumberLiteral() ? [type.value] : [],
				)
				return [
					symbol.name,
					{
						type: this._checker
							.typeToString(
								memberType,
								this._source,
								ts.TypeFormatFlags.NoTruncation | ts.TypeFormatFlags.InTypeAlias,
							)
							.replace(/\bSetup\./g, 'import("@soxa-ui/setup").'),
						...(declaredType ? { declaredType } : {}),
						...(values.length ? { values } : {}),
						required: !(symbol.flags & ts.SymbolFlags.Optional),
						...(description ? { description } : {}),
					},
				]
			}),
		)
	}

	private _alias(name: string): ts.Type {
		const type = this._aliases.get(name)
		if (!type) throw new Error(`Missing type alias: ${name}`)
		return type
	}

	contract(name: string, plugin = false): TContractTypes {
		return {
			// Facade inputs can be setters absent from the constructor's props interface.
			// Their value type still belongs to the descriptor's real instance, never a guessed constructor type.
			props: new Map([
				...(plugin
					? []
					: [...this._members(this._alias(`${name}Instance`))].map(
							([name, member]): [string, TMemberType] => [
								name,
								{ ...member, required: false },
							],
						)),
				...this._members(this._alias(`${name}Props`)),
			]),
			events: this._members(this._alias(`${name}Events`)),
			slots: plugin
				? new Map()
				: new Map(
						this._checker
							.getPropertiesOfType(this._alias(`${name}Slots`))
							.map((symbol) => [
								symbol.name,
								this._members(
									this._checker.getTypeOfSymbolAtLocation(symbol, this._source),
								),
							]),
					),
		}
	}

	exports(framework: TFramework): Set<string> {
		const file = resolve(root, `packages/ui/${framework}/src/index.ts`)
		const source = this._program.getSourceFile(file)
		const symbol = source && this._checker.getSymbolAtLocation(source)
		if (!symbol) throw new Error(`Missing adapter entry: ${file}`)
		return new Set(
			this._checker
				.getExportsOfModule(symbol)
				.filter(
					(entry) =>
						!entry.declarations?.every(
							(node) =>
								ts.isExportSpecifier(node) &&
								(node.isTypeOnly ||
									(ts.isExportDeclaration(node.parent.parent) &&
										node.parent.parent.isTypeOnly)),
						),
				)
				.map((entry) => entry.name),
		)
	}

	/** Stable repository paths, without checkout-specific absolute paths or line numbers. */
	declaration(name: string): string {
		const source = this._program.getSourceFile(resolve(root, 'packages/setup/index.ts'))
		const module = source && this._checker.getSymbolAtLocation(source)
		const exported =
			module && this._checker.getExportsOfModule(module).find((entry) => entry.name === name)
		const target =
			exported &&
			(exported.flags & ts.SymbolFlags.Alias
				? this._checker.getAliasedSymbol(exported)
				: exported)
		const declaration = target?.declarations?.[0]
		if (!declaration) throw new Error(`Missing source declaration: ${name}`)
		return sourcePath(declaration.getSourceFile().fileName)
	}
}

import { setTimeout } from 'node:timers/promises'
import type { TManifest } from './install-smoke.ts'

/** A release uses each package's version from its commit, including independent themes and icons. */
export function workspaceVersions(manifests: ReadonlyMap<string, TManifest>): Map<string, string> {
	return new Map(
		[...manifests].map(([name, manifest]) => {
			if (typeof manifest.version !== 'string' || manifest.version === '') {
				throw new Error(name + ': missing workspace version')
			}
			return [name, manifest.version]
		}),
	)
}

class RegistryPending extends Error {}

function isObject(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/** Check the install metadata, rather than a dist-tag which may still point at an older release. */
async function visible(name: string, version: string): Promise<void> {
	let response: Response
	try {
		response = await fetch('https://registry.npmjs.org/' + encodeURIComponent(name), {
			headers: { accept: 'application/vnd.npm.install-v1+json', 'cache-control': 'no-cache' },
			cache: 'no-store',
			signal: AbortSignal.timeout(10_000),
		})
	} catch (error) {
		throw new RegistryPending(name + ': ' + String(error))
	}

	if (!response.ok) {
		const message = name + ': npm HTTP ' + response.status
		if ([404, 408, 429].includes(response.status) || response.status >= 500) {
			throw new RegistryPending(message)
		}
		throw new Error(message)
	}

	const metadata: unknown = await response.json()
	if (!isObject(metadata) || !isObject(metadata.versions)) {
		throw new Error(name + ': invalid npm metadata')
	}
	const entry = metadata.versions[version]
	if (entry === undefined) throw new RegistryPending(name + '@' + version + ': not visible yet')
	if (
		!isObject(entry) ||
		entry.name !== name ||
		entry.version !== version ||
		!isObject(entry.dist) ||
		typeof entry.dist.tarball !== 'string'
	) {
		throw new Error(name + '@' + version + ': invalid npm version metadata')
	}
}

/** Only visibility and transient network failures retry; authorization and invalid metadata fail immediately. */
export async function waitForRegistry(
	versions: ReadonlyMap<string, string>,
	{
		attempts = 20,
		intervalMs = 10_000,
		report = console.log,
	}: {
		attempts?: number
		intervalMs?: number
		report?: (message: string) => void
	} = {},
): Promise<void> {
	let pending = [...versions]
	for (let attempt = 1; attempt <= attempts; attempt += 1) {
		const results = await Promise.all(
			pending.map(async ([name, version]) => {
				try {
					await visible(name, version)
					return undefined
				} catch (error) {
					if (!(error instanceof RegistryPending)) throw error
					return { name, version, message: error.message }
				}
			}),
		)
		const missing = results.filter((result) => result !== undefined)
		if (missing.length === 0) return
		report(
			'npm visibility ' +
				attempt +
				'/' +
				attempts +
				':\n' +
				missing.map(({ message }) => message).join('\n'),
		)
		if (attempt === attempts)
			throw new Error(
				'Published versions did not become available:\n' +
					missing.map(({ message }) => message).join('\n'),
			)
		pending = missing.map(({ name, version }) => [name, version])
		await setTimeout(intervalMs)
	}
}

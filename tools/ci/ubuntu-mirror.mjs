import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

// This independent mirror serves Ubuntu-signed archive and security suites.
const MIRROR = 'https://mirrors.edge.kernel.org/ubuntu'
const UBUNTU_SOURCE =
	/mirror\+file:\/{1,3}etc\/apt\/apt-mirrors\.txt\/?(?=\s|$)|https?:\/\/(?:azure\.archive|archive|security)\.ubuntu\.com\/ubuntu\/?(?=\s|$)/g

/** Bypass unavailable Ubuntu DNS hosts without changing suites, components or signing keys. */
export function ciUbuntuSources(source) {
	const deb822 = source.replace(
		/^(URIs:\s*)(.*)$/gm,
		(_line, field, uris) => field + uris.replace(UBUNTU_SOURCE, MIRROR),
	)

	return deb822.replace(
		/^(deb(?:-src)?\s+(?:\[[^\]]*\]\s+)?)(\S+)(\s+.*)$/gm,
		(_line, prefix, uri, suffix) => prefix + uri.replace(UBUNTU_SOURCE, MIRROR) + suffix,
	)
}

function configureRunnerSources() {
	if (
		process.platform !== 'linux' ||
		process.env.GITHUB_ACTIONS !== 'true' ||
		process.env.RUNNER_OS !== 'Linux'
	) {
		throw new Error('Ubuntu mirror selection is only for a GitHub Actions Linux runner')
	}

	const files = [
		'/etc/apt/sources.list',
		...readdirSync('/etc/apt/sources.list.d')
			.filter((file) => /\.(?:sources|list)$/.test(file))
			.map((file) => '/etc/apt/sources.list.d/' + file),
	]

	for (const file of files) {
		if (!existsSync(file)) continue
		const before = readFileSync(file, 'utf8')
		const after = ciUbuntuSources(before)
		if (before === after) continue

		writeFileSync(file, after)
		console.log(file + ': Ubuntu suites use ' + MIRROR + ' with the original signing keys')
	}
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url))
	configureRunnerSources()

import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ARCHIVE = 'https://archive.ubuntu.com/ubuntu'
const SECURITY = 'https://security.ubuntu.com/ubuntu'
const RUNNER_MIRROR =
	/mirror\+file:\/\/\/etc\/apt\/apt-mirrors\.txt\/?|mirror\+file:\/etc\/apt\/apt-mirrors\.txt\/?|https?:\/\/azure\.archive\.ubuntu\.com\/ubuntu\/?/g

/** Keep suites, components and signing keys; bypass the runner's failing Azure mirror method. */
export function officialUbuntuSources(source) {
	const deb822 = source
		.split('\n\n')
		.map((record) => {
			const uri = /^Suites:.*-security(?:\s|$)/m.test(record) ? SECURITY : ARCHIVE
			return record.replace(
				/^(URIs:\s*)(.*)$/gm,
				(_line, field, uris) => field + uris.replace(RUNNER_MIRROR, uri),
			)
		})
		.join('\n\n')

	return deb822.replace(
		/^(deb(?:-src)?\s+(?:\[[^\]]*\]\s+)?)(\S+)(\s+(\S+).*)$/gm,
		(_line, prefix, uri, suffix, suite) =>
			prefix +
			uri.replace(RUNNER_MIRROR, suite.endsWith('-security') ? SECURITY : ARCHIVE) +
			suffix,
	)
}

function configureRunnerSources() {
	if (
		process.platform !== 'linux' ||
		process.env.GITHUB_ACTIONS !== 'true' ||
		process.env.RUNNER_OS !== 'Linux'
	) {
		throw new Error('Ubuntu source selection is only for a GitHub Actions Linux runner')
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
		const after = officialUbuntuSources(before)
		if (before === after) continue

		writeFileSync(file, after)
		console.log(file + ': selected ' + ARCHIVE + ' (security suites: ' + SECURITY + ')')
	}
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url))
	configureRunnerSources()

import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'

/** Documents the first stage that started before per-command snapshots existed. */
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const directory = path.resolve(process.argv[2])
const file = path.join(directory, 'manifest.json')
const manifest = JSON.parse(fs.readFileSync(file, 'utf8'))
const hash = (file) => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex')
const relevant = Object.entries(manifest.sourceHashes).filter(
	([name]) =>
		name.startsWith('packages/') ||
		name.startsWith('tools/bench-pages/') ||
		name === 'package-lock.json',
)
const sourceVerification = relevant.map(([name, initial]) => ({
	file: name,
	initial,
	current: hash(path.join(root, name)),
	matches: hash(path.join(root, name)) === initial,
}))
if (sourceVerification.some((entry) => !entry.matches))
	throw new Error('Initial page workload sources/lock changed; cannot attest unchanged source')
const tree = (directory) =>
	fs
		.readdirSync(directory, { withFileTypes: true })
		.flatMap((entry) =>
			entry.isDirectory()
				? tree(path.join(directory, entry.name))
				: [path.join(directory, entry.name)],
		)
const builds = tree(path.join(root, 'tools/bench-pages/dist')).map((name) => ({
	file: path.relative(root, name).replaceAll('\\', '/'),
	sha256: hash(name),
	modified: fs.statSync(name).mtime.toISOString(),
}))
const commands = manifest.commands.filter(
	(command) => command.name.startsWith('pages-') && !command.snapshot,
)
for (const command of commands)
	if (builds.some((build) => new Date(build.modified) > new Date(command.started)))
		throw new Error('Page build modified after initial command started')
const attestation = {
	schemaVersion: 1,
	captured: new Date().toISOString(),
	appliesTo: commands.map((c) => c.name),
	sourceVerification,
	builds,
	evidence:
		'Source hashes were recorded by the manifest before the first page command. This later attestation checks unchanged source/lock and hashes build files whose mtimes all precede the commands. It does not claim build hashes were captured before measurement.',
}
fs.writeFileSync(
	path.join(directory, 'initial-pages-attestation.json'),
	JSON.stringify(attestation) + '\n',
)
for (const command of commands) command.lateAttestation = 'initial-pages-attestation.json'
fs.writeFileSync(file, JSON.stringify(manifest) + '\n')

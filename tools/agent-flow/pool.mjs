/** Read the owner's existing worktree pool; never create or switch worktrees. */
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { basename, dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

export const git = (cwd, ...args) =>
	execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim()

export function poolSnapshot(cwd = process.cwd()) {
	const common = git(cwd, 'rev-parse', '--path-format=absolute', '--git-common-dir')
	const locks = join(common, 'agent-locks')
	const trees = git(cwd, 'worktree', 'list', '--porcelain')
		.split(/\r?\n\r?\n/)
		.filter(Boolean)
		.map((block) => ({
			path: /^worktree (.+)$/m.exec(block)?.[1],
			branch: /^branch refs\/heads\/(.+)$/m.exec(block)?.[1] ?? '(detached)',
		}))
	const main = trees[0]
	if (!main?.path) throw new Error('Cannot identify the main worktree')
	const prefix = `${basename(main.path)}-`
	const rows = trees
		.slice(1)
		.filter(
			(tree) =>
				tree.path &&
				dirname(tree.path) === dirname(main.path) &&
				basename(tree.path).startsWith(prefix) &&
				basename(tree.path) !== `${prefix}conflicts`,
		)
		.map((tree) => {
			const name = basename(tree.path)
			const lock = join(locks, name)
			const missing = !existsSync(tree.path)
			const dirty = !missing && git(tree.path, 'status', '--porcelain') !== ''
			const task = existsSync(join(lock, 'task'))
				? readFileSync(join(lock, 'task'), 'utf8').trim()
				: null
			return {
				...tree,
				name,
				missing,
				dirty,
				locked: existsSync(lock),
				task,
				free: !missing && !dirty && !existsSync(lock),
			}
		})
	const inFolders = new Set(rows.map((row) => row.task))
	const taskLocks = existsSync(locks)
		? readdirSync(locks)
				.filter((name) => name.startsWith('task-'))
				.map((name) => name.slice(5))
		: []
	return {
		main: main.path,
		common,
		locks,
		rows,
		free: rows.filter((row) => row.free).length,
		tasksWithoutFolder: taskLocks.filter((id) => !inFolders.has(id)),
	}
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
	console.log(JSON.stringify(poolSnapshot(), null, 2))
}

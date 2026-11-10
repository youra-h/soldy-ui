import { A11Y_EXCEPTIONS } from './exceptions'
import type { Result } from 'axe-core'
import { A11Y_CASES, A11Y_ADAPTERS } from '@soxa-ui/playground-shared'

export type TAuditException = {
	readonly browser: 'chromium' | 'webkit'
	readonly adapter: string
	readonly case: string
	readonly rule: string
	/** A unique node selector, resolved against the original axe target in this document. */
	readonly selector: string
	readonly reason: string
	readonly task: string
}
export type TAuditContext = {
	readonly browser: string
	readonly adapter: string
	readonly case: string
}

export { A11Y_EXCEPTIONS } from './exceptions'

export function validateExceptions(exceptions: readonly TAuditException[]): void {
	const keys = new Set<string>()

	for (const entry of exceptions) {
		if (
			!['chromium', 'webkit'].includes(entry.browser) ||
			!A11Y_ADAPTERS.some((id) => id === entry.adapter) ||
			!A11Y_CASES.some((value) => value.id === entry.case)
		)
			throw new Error('Exception must name an existing browser, adapter and audit case')
		if (
			!entry.rule.trim() ||
			entry.rule.includes('*') ||
			entry.reason.trim().length < 12 ||
			!/^[a-z0-9]{9}$/.test(entry.task)
		)
			throw new Error(
				'Exception needs an exact rule, a reason and a ClickUp remediation task',
			)
		if (!/^[.#][a-zA-Z]/.test(entry.selector) || /[*,]/.test(entry.selector))
			throw new Error('Exception needs one exact node selector')

		const key = JSON.stringify([
			entry.browser,
			entry.adapter,
			entry.case,
			entry.rule,
			entry.selector,
		])

		if (keys.has(key)) throw new Error('Duplicate exception')
		keys.add(key)
	}
}

/** Original targets and unique selectors must resolve to the same node; mount ids are not exemptions. */
export function auditGate(
	violations: readonly Result[],
	context: TAuditContext,
	exceptions: readonly TAuditException[] = A11Y_EXCEPTIONS,
) {
	validateExceptions(exceptions)

	const scoped = exceptions.filter(
		(entry) =>
			entry.browser === context.browser &&
			entry.adapter === context.adapter &&
			entry.case === context.case,
	)

	const used = new Set<TAuditException>()
	const identities = new Map<TAuditException, Element>()

	for (const entry of scoped) {
		const nodes = document.querySelectorAll(entry.selector)

		if (nodes.length > 1) throw new Error('Ambiguous exception node: ' + entry.selector)

		const node = nodes[0]
		if (node) identities.set(entry, node)
	}

	const failures: { rule: string; impact: string | null | undefined; target: unknown }[] = []
	const waived: { exception: TAuditException; rule: string; target: unknown }[] = []

	for (const violation of violations) {
		for (const node of violation.nodes) {
			const target = node.target[0]
			const nodes =
				node.target.length === 1 && typeof target === 'string'
					? document.querySelectorAll(target)
					: undefined
			const original = nodes?.length === 1 ? nodes[0] : undefined
			const exception = original
				? scoped.find(
						(entry) =>
							entry.rule === violation.id && identities.get(entry) === original,
					)
				: undefined

			if (exception) {
				used.add(exception)
				waived.push({ exception, rule: violation.id, target: node.target })
			} else if (violation.impact === 'serious' || violation.impact === 'critical')
				failures.push({ rule: violation.id, impact: violation.impact, target: node.target })
		}
	}

	const stale = scoped.filter((entry) => !used.has(entry))

	return { failures, waived, stale }
}

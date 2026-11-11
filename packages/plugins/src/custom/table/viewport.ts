import type { ITable } from '@soxa-ui/core'

/** The scrolling wrapper is the semantic table root's immediate parent. */
export function tableViewportOf(owner: Pick<ITable, 'classes'>, root: Element): Element | null {
	const parent = root.parentElement

	return parent?.classList.contains(owner.classes.resolve('__viewport')) ? parent : null
}

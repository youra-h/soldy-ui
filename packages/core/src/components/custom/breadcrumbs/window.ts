import type { TBreadcrumbsEntry, TBreadcrumbsItem } from './types'

/** Invalid limits use the default; finite positive values are integral and at least three. */
export function breadcrumbsLimit(value: number): number {
	if (value === 0) return 0
	return Number.isFinite(value) && value > 0 ? Math.max(3, Math.floor(value)) : 5
}

/** A pure projection: first location, overflow, and trailing locations. */
export function breadcrumbsWindow(
	items: readonly TBreadcrumbsItem[],
	limit: number,
): {
	entries: readonly TBreadcrumbsEntry[]
	hiddenEntries: readonly TBreadcrumbsEntry[]
} {
	const all = items.map((item, index): TBreadcrumbsEntry => ({
		item,
		index,
		current: index === items.length - 1,
		aria: index === items.length - 1 ? { 'aria-current': 'page' } : {},
		dataset: {
			'data-current': index === items.length - 1 ? 'true' : 'false',
			'data-breadcrumb-index': index,
		},
		attrs:
			item.href === undefined ? {} : { href: item.href, target: item.target, rel: item.rel },
	}))
	const max = breadcrumbsLimit(limit)
	if (max === 0 || all.length <= max) return { entries: all, hiddenEntries: [] }
	const tail = all.length - max + 2
	return { entries: [...all.slice(0, 1), ...all.slice(tail)], hiddenEntries: all.slice(1, tail) }
}

export function sameBreadcrumbs(
	a: readonly TBreadcrumbsItem[],
	b: readonly TBreadcrumbsItem[],
): boolean {
	return (
		a === b ||
		(a.length === b.length &&
			a.every((item, index) => {
				const other = b[index]
				return (
					item.text === other?.text &&
					item.href === other.href &&
					item.target === other.target &&
					item.rel === other.rel
				)
			}))
	)
}

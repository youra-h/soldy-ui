import { createComponentEngine } from '../../../base/collection/create/internal'
import type { TCreateEngineOptions } from '../../../base/collection'
import type { IBreadcrumbs } from '../types'
import type { IBreadcrumbsItem } from '../item/types'
import { breadcrumbsExtensions } from './factory'
import type { TBreadcrumbsCollection } from './types'

/**
 * Create a breadcrumb engine with standard activation and a retained overflow window.
 * Mark the current data item through metadata; its position alone does not activate it.
 *
 * @example
 * createEngineBreadcrumbs({
 *   items: [{ text: 'Home', href: '/' }, { text: 'Page', _: { active: true } }],
 * })
 */
export function createEngineBreadcrumbs(
	options: TCreateEngineOptions<IBreadcrumbsItem> & { owner?: IBreadcrumbs } = {},
): TBreadcrumbsCollection {
	return createComponentEngine(breadcrumbsExtensions(), options)
}

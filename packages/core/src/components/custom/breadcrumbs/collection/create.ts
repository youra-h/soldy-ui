import { createComponentEngine } from '../../../base/collection/create/internal'
import type { TCreateEngineOptions } from '../../../base/collection'
import type { IBreadcrumbs } from '../types'
import type { IBreadcrumbsItem } from '../item/types'
import { breadcrumbsExtensions } from './factory'
import type { TBreadcrumbsCollection } from './types'

export function createEngineBreadcrumbs(
	options: TCreateEngineOptions<IBreadcrumbsItem> & { owner?: IBreadcrumbs } = {},
): TBreadcrumbsCollection {
	return createComponentEngine(breadcrumbsExtensions(), options)
}

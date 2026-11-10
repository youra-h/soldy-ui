import { createComponentEngine } from '../../../base/collection/create/internal'
import type { TCreateEngineOptions } from '../../../base'
import { toggleGroupExtensions } from './factory'
import type { TToggleGroupCollection } from './types'
import type { IToggleGroup } from '../types'
import type { IToggleGroupItem } from '../item/types'

/** Builds a selection engine that can be passed to any ToggleGroup adapter. */
export function createEngineToggleGroup(
	options: TCreateEngineOptions<IToggleGroupItem> & { owner?: IToggleGroup } = {},
): TToggleGroupCollection {
	return createComponentEngine(toggleGroupExtensions(), options)
}

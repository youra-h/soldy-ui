import { TToggleGroupExtension } from './extensions'
import { selectionExtensions } from './../../../base/collection/create/internal'
import type { TExtensionSet } from './../../../base/collection/create/internal'
import TToggleGroupItem from './../item/item.class'
import type { IToggleGroupItem } from './../item/types'

/** Selection must precede group semantics, which reads its current selection. */
export function toggleGroupExtensions(): TExtensionSet<IToggleGroupItem> {
	return {
		...selectionExtensions<IToggleGroupItem>(TToggleGroupItem),
		toggleGroup: () => new TToggleGroupExtension(),
	}
}

/**
 * Определение TCollectionElements (namespace `elements`) — DOM-узлы элементов коллекции.
 *
 * Зависит от CollectionBundlesPlugin (регистрируется в том же bundle).
 */

import { definePlugin } from '../../../protected/define'
import { TCollectionElements } from '@soxa-ui/plugins'

export const CollectionElementsPluginDescriptor = definePlugin({
	ctor: TCollectionElements,
	namespace: 'elements',
})

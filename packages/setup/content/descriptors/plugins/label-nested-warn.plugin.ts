/**
 * Определение TLabelNestedWarnPlugin (namespace `nestedWarn`) — диагностика вложенного `label`.
 *
 * Предупреждает, если внутри корня-`label` подписи Label оказался другой
 * `label` — обычно радио без tag="span".
 */

import { definePlugin } from '../../../protected/define'
import { TLabelNestedWarnPlugin } from '@soxa-ui/plugins'

export const LabelNestedWarnPluginDescriptor = definePlugin({
	ctor: TLabelNestedWarnPlugin,
	namespace: 'nestedWarn',
})

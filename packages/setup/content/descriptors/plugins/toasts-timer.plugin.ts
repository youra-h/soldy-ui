/**
 * Определение TToastsTimerPlugin (namespace `timer`) — отсчёт тостов: время
 * вышло — тост закрывается.
 *
 * Пропсов нет: длительность — свойство владельца и тоста, а пауза (указатель
 * и фокус в регионе, скрытая вкладка) — операция над узлом и документом.
 */

import { definePlugin } from '../../../protected/define'
import { TToastsTimerPlugin } from '@soxa-ui/plugins'

export const ToastsTimerPluginDescriptor = definePlugin({
	ctor: TToastsTimerPlugin,
	namespace: 'timer',
})

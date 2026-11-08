import { defineConfig } from 'vitest/config'
import path from 'node:path'

/**
 * Пакет потребляет исходники соседних воркспейсов напрямую, как это делают
 * тесты остальных пакетов: алиасы вместо сборки.
 *
 * Окружение по умолчанию — node. Спеку с DOM нужна первая строка
 * `// @vitest-environment jsdom`; `pretendToBeVisual` даёт ей
 * `requestAnimationFrame`, на котором ждёт кадра раннер сценариев.
 */
export default defineConfig({
	test: {
		environmentOptions: {
			jsdom: { pretendToBeVisual: true },
		},
	},
	resolve: {
		alias: {
			'@soxa-ui/core': path.resolve(import.meta.dirname, '../../core/src'),
			'@soxa-ui/plugins': path.resolve(import.meta.dirname, '../../plugins/src'),
			'@soxa-ui/setup': path.resolve(import.meta.dirname, '../../setup/index.ts'),
		},
	},
})

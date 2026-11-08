import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import path from 'node:path'

export default defineConfig({
	plugins: [vue()],
	resolve: {
		alias: {
			'@soxa-ui/vue': path.resolve(import.meta.dirname, 'src/index.ts'),
			'@soxa-ui/core': path.resolve(import.meta.dirname, '../../core/src'),
			'@soxa-ui/icons-material': path.resolve(
				import.meta.dirname,
				'../../icons/material/src',
			),
			'@soxa-ui/plugins': path.resolve(import.meta.dirname, '../../plugins/src'),
			'@soxa-ui/setup': path.resolve(import.meta.dirname, '../../setup/index.ts'),
		},
	},
	test: {
		environment: 'jsdom',
		environmentOptions: {
			jsdom: { pretendToBeVisual: true },
		},
		setupFiles: ['./__tests__/setup.ts'],
		include: ['__tests__/**/*.spec.ts'],
	},
})

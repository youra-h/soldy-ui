import { defineConfig } from 'vitest/config'
import path from 'node:path'

export default defineConfig({
	resolve: {
		alias: {
			'@soxa-ui/core': path.resolve(import.meta.dirname, 'src'),
		},
	},
	test: {
		include: ['__tests__/**/*.{test,spec}.ts'],
	},
})

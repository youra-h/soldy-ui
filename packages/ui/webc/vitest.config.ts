import { defineConfig } from 'vitest/config'
import path from 'node:path'
import { subpathSources } from '../../../tools/vite/lib.config.ts'

export default defineConfig({
	resolve: {
		alias: {
			// The entries of the elements, before the package root: an alias is
			// matched by prefix
			...subpathSources({
				name: '@soxa-ui/webc',
				root: import.meta.dirname,
				entry: 'src/index.ts',
			}),
			'@soxa-ui/core': path.resolve(import.meta.dirname, '../../core/src'),
			'@soxa-ui/icons-material': path.resolve(
				import.meta.dirname,
				'../../icons/material/src',
			),
			'@soxa-ui/plugins': path.resolve(import.meta.dirname, '../../plugins/src'),
			'@soxa-ui/setup': path.resolve(import.meta.dirname, '../../setup/index.ts'),
			'@soxa-ui/webc': path.resolve(import.meta.dirname, 'src/index.ts'),
		},
	},
	test: {
		environment: 'jsdom',
		include: ['__tests__/**/*.spec.ts'],
		setupFiles: ['./__tests__/setup.ts'],
	},
})

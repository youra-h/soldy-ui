import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'node:path'

export default defineConfig({
	plugins: [react()],
	resolve: {
		alias: {
			'@soxa-ui/core': path.resolve(import.meta.dirname, '../../core/src'),
			'@soxa-ui/icons-material': path.resolve(
				import.meta.dirname,
				'../../icons/material/src',
			),
			'@soxa-ui/plugins': path.resolve(import.meta.dirname, '../../plugins/src'),
			'@soxa-ui/setup': path.resolve(import.meta.dirname, '../../setup/index.ts'),
			'@soxa-ui/react': path.resolve(import.meta.dirname, 'src/index.ts'),
		},
	},
	test: {
		environment: 'jsdom',
		setupFiles: ['./__tests__/setup.ts'],
		include: ['__tests__/**/*.spec.tsx'],
	},
})

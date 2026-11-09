import { defineConfig } from 'vitest/config'
import { resolve } from 'node:path'

export default defineConfig({
	resolve: {
		alias: {
			'@soxa-ui/core': resolve(import.meta.dirname, '../../packages/core/src/index.ts'),
			'@soxa-ui/plugins': resolve(import.meta.dirname, '../../packages/plugins/src/index.ts'),
			'@soxa-ui/setup': resolve(import.meta.dirname, '../../packages/setup/index.ts'),
		},
	},
	test: { include: ['*.spec.ts'], testTimeout: 60_000, hookTimeout: 60_000 },
})

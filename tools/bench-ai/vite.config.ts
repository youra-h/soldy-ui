import path from 'node:path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { aliases } from '../../packages/playground/vue/vite.base'

export default defineConfig({
	root: import.meta.dirname,
	plugins: [vue()],
	resolve: {
		alias: {
			'bench-candidate': path.resolve(
				process.env.BENCH_CANDIDATE ?? path.join(import.meta.dirname, 'Soxa.vue'),
			),
			...aliases({ themeCss: true }),
		},
	},
	ssr: { noExternal: true },
	build: { target: 'esnext' },
})

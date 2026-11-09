import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import { fileURLToPath } from 'node:url'
export default defineConfig({
	plugins: [vue(), tailwindcss()],
	build: {
		rollupOptions: {
			input: Object.fromEntries(
				['index', 'components', 'baseline'].map((name) => [
					name,
					fileURLToPath(new URL('./' + name + '.html', import.meta.url)),
				]),
			),
		},
	},
})

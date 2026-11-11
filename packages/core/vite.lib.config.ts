import { libConfig } from '../../tools/vite/lib.config.ts'

/** Headless models; declarations are emitted by tsc after the JavaScript build. */
export default libConfig({
	name: '@soxa-ui/core',
	root: import.meta.dirname,
	entry: 'src/index.ts',
	// Keep the syntax engines as declared dependencies, with their own package licenses.
	external: ['lowlight', 'highlight.js'],
})

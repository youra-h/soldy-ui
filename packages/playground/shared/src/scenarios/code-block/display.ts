import type { TScenario } from '../types'
const snippets = [
	{
		value: 'vue',
		label: 'Vue',
		code: '<script setup>\nconst title = "Soxa UI"\n</script>\n',
		language: 'vue',
		filename: 'App.vue',
	},
	{
		value: 'react',
		label: 'React',
		code: 'export const title = "Soxa UI";\n',
		language: 'tsx',
		filename: 'App.tsx',
	},
	{
		value: 'svelte',
		label: 'Svelte',
		code: '<h1>Soxa UI</h1>\n',
		language: 'svelte',
		filename: 'App.svelte',
	},
]
const code = '  <img src=x>\n\nconsole.log("Soxa UI");\n'
export const CODE_BLOCK_SCENARIOS: readonly TScenario[] = [
	...[
		{ key: 'basic', props: { code }, header: false },
		{ key: 'title', props: { code, title: 'main.ts' }, header: true },
		{ key: 'line-numbers', props: { code, lineNumbers: true }, header: false },
		{
			key: 'highlighted-lines',
			props: { code, lineNumbers: true, highlightLines: [2] },
			header: false,
		},
		{
			key: 'long-code',
			props: {
				code: 'const text = "' + 'long '.repeat(60) + '";\n' + code,
				maxHeight: 100,
				wrap: true,
			},
			header: false,
		},
	].map(({ key, props, header }): TScenario => ({
		id: 'code-block/slots/' + key,
		component: 'code-block',
		topic: 'slots',
		kind: 'auto',
		title: 'CodeBlock: ' + key,
		description: 'Safe source text, optional header and logical code lines',
		props,
		run: async (ctx) => {
			await ctx.frame()
			const text = [...ctx.scene.querySelectorAll('.so-code-block__text')]
				.map((node) => node.textContent)
				.join('')
			ctx.check(text === props.code, 'The exact source is displayed as text')
			ctx.check(
				Boolean(ctx.scene.querySelector('.so-code-block__header:not([hidden])')) === header,
				'The header exists only when titled',
			)
			ctx.check(ctx.scene.querySelector('img') === null, 'Source HTML remains inert')
		},
	})),
	{
		id: 'code-block/events/dynamic-tabs',
		component: 'code-block',
		topic: 'events',
		kind: 'auto',
		title: 'CodeBlock: dynamic Tabs',
		description: 'Activation uses Tabs and moves to the next surviving snippet',
		props: { code: '', snippets },
		run: async (ctx) => {
			ctx.instance.value = 'react'
			await ctx.frame()
			ctx.check(ctx.instance.value === 'react', 'The requested snippet is active')
			ctx.instance.snippets = [snippets[0], snippets[2]]
			await ctx.frame()
			ctx.check(
				ctx.instance.value === 'svelte',
				'Removing the active snippet activates its next neighbour',
			)
			ctx.instance.snippets = []
			await ctx.frame()
			const copy = ctx.scene.querySelector('.so-code-block__copy')
			ctx.check(
				copy instanceof HTMLButtonElement && copy.disabled,
				'Copy is disabled for an empty snippet list',
			)
		},
	},
]

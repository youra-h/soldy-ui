import { createSSRApp } from 'vue'
import { renderToString } from 'vue/server-renderer'
import Page from './Page.vue'
export async function render(props) {
	const context = {}
	const html = await renderToString(createSSRApp(Page, props), context)
	return { html, teleports: context.teleports ?? {} }
}

import { createSSRApp, h } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { LocaleProvider } from '@soxa-ui/vue'
import { PREVIEWS, toComponent } from '../../../packages/playground/vue/src/hosts/vue/previews'
import { measure } from './measure'

// Keep one wrapper per preview, matching the current playground host contract.
const previews = Object.fromEntries(
	Object.entries(PREVIEWS).map(([id, render]) => [id, toComponent(render, {})]),
)

/**
 * The Vue page: an application per request (`createSSRApp`), as a server
 * renders one, with the previews of the stand's Vue host under the provider.
 */
await measure(
	{
		framework: 'vue',
		render(locale, components) {
			const app = createSSRApp({
				render: () =>
					h(LocaleProvider, { locale }, () =>
						components.map(({ id, props }) => h(previews[id], { ...props, key: id })),
					),
			})

			return renderToString(app)
		},
	},
	Object.keys(PREVIEWS),
)

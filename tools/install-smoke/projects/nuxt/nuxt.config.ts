// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	compatibilityDate: '2025-07-15',
	devtools: { enabled: false },
	css: ['@soxa-ui/theme-oren'],
	app: { head: { title: 'Soxa UI — Nuxt', htmlAttrs: { lang: 'en' } } },
})

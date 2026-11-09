import { createSSRApp } from 'vue'
import Page from './Page.vue'
createSSRApp(Page, JSON.parse(document.querySelector('#input').textContent)).mount('#app')
document.documentElement.dataset.benchHydrated = 'true'

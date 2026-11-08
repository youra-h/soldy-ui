import { createApp } from 'vue'
import { useIcons, useTheme } from '@soxa-ui/setup'
import * as material from '@soxa-ui/icons-material'
import App from './App.vue'
import { router } from './router'
import { DEFAULT_ROUTE } from './navigation'

import '@soxa-ui/theme-oren'
import oren from '@soxa-ui/theme-oren/setup'
import './styles.css'

// Пакет иконок и поведение темы — общие на страницу: их видят и оболочка, и
// хосты превью всех фреймворков
useIcons(material)
useTheme(oren)

// Прямая ссылка сильнее умолчания: перезагрузка страницы компонента должна
// оставлять на ней, а не выкидывать на витрину
if (!window.location.hash) window.location.hash = DEFAULT_ROUTE

createApp(App).use(router).mount('#app')

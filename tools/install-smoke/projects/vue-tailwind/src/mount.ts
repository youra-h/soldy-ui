import { createApp } from 'vue'
import { useIcons, useTheme } from '@soxa-ui/setup'
import * as material from '@soxa-ui/icons-material'
import oren from '@soxa-ui/theme-oren/setup'
import App from './App.vue'

useIcons(material)
useTheme(oren)

createApp(App).mount('#app')

import { createApp } from 'vue'
import { useIcons, useTheme } from '@soxa-ui/setup'
import * as material from '@soxa-ui/icons-material'
import oren from '@soxa-ui/theme-oren/setup'
import '@soxa-ui/theme-oren'
import ManualAudit from './ManualAudit.vue'
import './style.css'

useIcons(material)
useTheme(oren)
createApp(ManualAudit).mount('#app')

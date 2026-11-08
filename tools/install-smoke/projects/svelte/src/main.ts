import { mount } from 'svelte'
import { useIcons, useTheme } from '@soxa-ui/setup'
import * as material from '@soxa-ui/icons-material'
import oren from '@soxa-ui/theme-oren/setup'
import App from './App.svelte'

import '@soxa-ui/theme-oren'

useIcons(material)
useTheme(oren)

const target = document.getElementById('app')

if (target === null) {
	throw new Error('#app is missing from index.html')
}

mount(App, { target })

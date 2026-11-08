import { render } from 'solid-js/web'
import { useIcons, useTheme } from '@soxa-ui/setup'
import * as material from '@soxa-ui/icons-material'
import oren from '@soxa-ui/theme-oren/setup'
import { App } from './App.tsx'

import '@soxa-ui/theme-oren'

useIcons(material)
useTheme(oren)

const root = document.getElementById('root')

if (root === null) {
	throw new Error('#root is missing from index.html')
}

render(() => <App />, root)

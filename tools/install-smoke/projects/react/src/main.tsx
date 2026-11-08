import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
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

createRoot(root).render(
	<StrictMode>
		<App />
	</StrictMode>,
)

import { bootstrapApplication } from '@angular/platform-browser'
import { useIcons, useTheme } from '@soxa-ui/setup'
import * as material from '@soxa-ui/icons-material'
import oren from '@soxa-ui/theme-oren/setup'
import { appConfig } from './app/app.config'
import { App } from './app/app'

useIcons(material)
useTheme(oren)

bootstrapApplication(App, appConfig).catch((error: unknown) => console.error(error))

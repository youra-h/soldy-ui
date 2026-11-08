import { useIcons, useTheme } from '@soxa-ui/setup'
import * as material from '@soxa-ui/icons-material'
import oren from '@soxa-ui/theme-oren/setup'

// The registries are global: filled once per process, on the server too, not
// once per request
useIcons(material)
useTheme(oren)

export default defineNuxtPlugin(() => {})

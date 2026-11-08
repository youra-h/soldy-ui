import { useIcons, useTheme } from '@soxa-ui/setup'
import * as material from '@soxa-ui/icons-material'
import '@soxa-ui/theme-oren'
import oren from '@soxa-ui/theme-oren/setup'

/**
 * soxa as an application sets it up (README of the packages): the icon pack,
 * the theme with its behavior, the locale provider at the root (`Root`) — as
 * the host of the developer stand does. Only the size entries use these files:
 * the runtime pages of soxa are the hosts themselves (`tools/bench-pages`).
 */
useIcons(material)
useTheme(oren)

export { default as Root } from './Root.svelte'

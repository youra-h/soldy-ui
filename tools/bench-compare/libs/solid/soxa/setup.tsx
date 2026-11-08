import type { JSX } from 'solid-js'
import { useIcons, useTheme } from '@soxa-ui/setup'
import * as material from '@soxa-ui/icons-material'
import { enUS } from '@soxa-ui/plugins'
import { LocaleProvider } from '@soxa-ui/solid'
import '@soxa-ui/theme-oren'
import oren from '@soxa-ui/theme-oren/setup'

/**
 * soxa as an application sets it up (README of the packages): the icon pack,
 * the theme with its behavior, the locale provider at the root — as the host
 * of the developer stand does. Only the size entries use these files: the
 * runtime pages of soxa are the hosts themselves (`tools/bench-pages`).
 */
useIcons(material)
useTheme(oren)

export function Root(props: { children?: JSX.Element }) {
	return <LocaleProvider locale={enUS}>{props.children}</LocaleProvider>
}

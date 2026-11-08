import { useIcons, useTheme } from '@soxa-ui/setup'
import * as material from '@soxa-ui/icons-material'
import { enUS } from '@soxa-ui/plugins'
import { TLocaleProviderElement } from '@soxa-ui/webc/locale-provider'
import '@soxa-ui/theme-oren'
import oren from '@soxa-ui/theme-oren/setup'

/**
 * soxa as an application sets it up (README of the packages): the icon pack,
 * the theme with its behavior, the locale provider at the root — as the host
 * of the developer stand does. Elements register on import of their entries:
 * each page imports the entries of the elements it writes, as the pages of the
 * neighbors import their components, and the provider comes from an entry of
 * its own. Only the size entries use these files: the runtime pages of soxa
 * are the hosts themselves (`tools/bench-pages`).
 */
useIcons(material)
useTheme(oren)

export function root(): HTMLElement {
	const provider = new TLocaleProviderElement()

	provider.locale = enUS

	return provider
}

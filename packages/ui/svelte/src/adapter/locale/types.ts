import type { Snippet } from 'svelte'
import type { TLocale } from '@soxa-ui/plugins'

export type TLocaleProviderProps = {
	/** Тег для Intl и строки библиотеки (`ruRU`, `extendLocale(...)`). */
	locale: TLocale
	children?: Snippet
}

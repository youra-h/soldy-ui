import type { InjectionKey } from 'vue'
import type { ILocaleSource } from '@soxa-ui/plugins'

/**
 * Ключ локали поддерева: под ним `LocaleProvider` отдаёт детям свой источник,
 * а сборка компонента (`createVueAdapterContext`) берёт ближайший.
 */
export const LOCALE_KEY: InjectionKey<ILocaleSource> = Symbol('soxa:locale')

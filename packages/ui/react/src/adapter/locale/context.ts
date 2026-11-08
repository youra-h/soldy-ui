import { createContext } from 'react'
import type { ILocaleSource } from '@soxa-ui/plugins'

/** Источник локали ближайшего `LocaleProvider`; вне провайдера — `undefined`. */
export const LocaleContext = createContext<ILocaleSource | undefined>(undefined)

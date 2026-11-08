import type { IAdapterProfile } from '@soxa-ui/setup'
import { SolidNaming } from './naming'

/** Профиль связки (`adapter.connect()`): имена и слот по умолчанию `children`. */
export const SolidProfile: IAdapterProfile = { naming: SolidNaming, defaultSlot: 'children' }

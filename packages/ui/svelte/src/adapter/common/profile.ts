import type { IAdapterProfile } from '@soxa-ui/setup'
import { SvelteNaming } from './naming'

export const SvelteProfile: IAdapterProfile = { naming: SvelteNaming, defaultSlot: 'children' }

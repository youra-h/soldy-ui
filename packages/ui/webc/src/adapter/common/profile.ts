import type { IAdapterProfile } from '@soxa-ui/setup'
import { WebcNaming } from './naming'

/** Одна поверхность на класс элемента (атрибуты, свойства) и на связку. */
export const WebcProfile: IAdapterProfile = { naming: WebcNaming }

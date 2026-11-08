import type { ComponentType } from 'react'
import type { IToastsItem } from '@soxa-ui/core'

/** Своё содержимое тоста (`render`): компонент React с пропом `toast`. */
export type TToastRender = ComponentType<{ toast: IToastsItem }>

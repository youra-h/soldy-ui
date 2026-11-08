import type { Component } from 'svelte'
import type { IToastsItem } from '@soxa-ui/core'

/** Своё содержимое тоста (`render`): ядро его не читает, тип даёт адаптер. */
export type TToastRender = Component<{ toast: IToastsItem }>

import type { ButtonProps, useToasts, TToastRender } from '@soxa-ui/vue'

export type TPublicToastApi = [typeof useToasts, TToastRender]
export type TButtonText = Pick<ButtonProps, 'text'>
export const validButtonText: TButtonText = { text: 'Save' }
// @ts-expect-error Component props retain their value types in the installed package.
export const invalidButtonText: TButtonText = { text: 42 }

// @ts-expect-error Adapter assembly is not an application API.
import type { useAdapter } from '@soxa-ui/vue'
export type TAssemblyMustStayPrivate = typeof useAdapter

// @ts-expect-error No public internal entry point is provided.
import type { useAdapter as internalAdapter } from '@soxa-ui/vue/internal'
export type TInternalMustStayPrivate = typeof internalAdapter

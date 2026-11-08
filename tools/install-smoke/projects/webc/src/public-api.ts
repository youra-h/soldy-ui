import type { TButtonElementProps, toastsOf, TToastRender } from '@soxa-ui/webc'

export type TPublicToastApi = [typeof toastsOf, TToastRender]
export type TButtonText = Pick<TButtonElementProps, 'text'>
export const validButtonText: TButtonText = { text: 'Save' }
// @ts-expect-error Component props retain their value types in the installed package.
export const invalidButtonText: TButtonText = { text: 42 }

// @ts-expect-error Adapter assembly is not an application API.
import type { useAdapter } from '@soxa-ui/webc'
export type TAssemblyMustStayPrivate = typeof useAdapter

// @ts-expect-error No public internal entry point is provided.
import type { useAdapter as internalAdapter } from '@soxa-ui/webc/internal'
export type TInternalMustStayPrivate = typeof internalAdapter

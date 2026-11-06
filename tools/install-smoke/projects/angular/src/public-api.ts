import type { TButtonComponent, useToasts, TToastRender } from '@soldy-ui/angular'

export type TPublicToastApi = [typeof useToasts, TToastRender]
export type TButtonText = Pick<TButtonComponent, 'text'>
export const validButtonText: TButtonText = { text: 'Save' }
// @ts-expect-error Component props retain their value types in the installed package.
export const invalidButtonText: TButtonText = { text: 42 }

// @ts-expect-error Adapter assembly is not an application API.
import type { useAdapter } from '@soldy-ui/angular'
export type TAssemblyMustStayPrivate = typeof useAdapter

// @ts-expect-error No public internal entry point is provided.
import type { useAdapter as internalAdapter } from '@soldy-ui/angular/internal'
export type TInternalMustStayPrivate = typeof internalAdapter

import type { IAdapterProfile } from '@soldy-ui/setup'
import { AngularNaming } from './naming'

/** One surface for code generation and runtime bindings, including native Angular models. */
export const AngularProfile: IAdapterProfile = {
	naming: AngularNaming,
	model: (exportName) => `${exportName}Change`,
}

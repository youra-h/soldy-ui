import { resolveSlotName } from '@soxa-ui/setup'
import { VueProfile } from '../../packages/ui/vue/src/adapter/common/profile'
import { ReactProfile } from '../../packages/ui/react/src/adapter/common/profile'
import { AngularProfile } from '../../packages/ui/angular/src/adapter/common/profile'
import { SolidProfile } from '../../packages/ui/solid/src/adapter/common/profile'
import { SvelteProfile } from '../../packages/ui/svelte/src/adapter/common/profile'
import { WebcProfile } from '../../packages/ui/webc/src/adapter/common/profile'
import type { TFramework, TFrameworkSpec } from './types'

/** Syntax wraps the actual surface names; it never translates canonical names. */
export const frameworks: Record<TFramework, TFrameworkSpec> = {
	vue: {
		profile: VueProfile,
		exportName: (name) => name,
		property: (name) => `:${name}`,
		event: (name) => `@${name}`,
		slot: (name) => `<template #${name}>`,
	},
	react: {
		profile: ReactProfile,
		exportName: (name) => name,
		property: (name) => name,
		event: (name) => name,
		slot: (name) => resolveSlotName(name, 'children'),
	},
	angular: {
		profile: AngularProfile,
		exportName: (name) => `T${name}Component`,
		property: (name) => `[${name}]`,
		event: (name) => `(${name})`,
		slot: (name, scoped) =>
			scoped
				? `<ng-template slot="${name}">`
				: name === 'default'
					? '<ng-content>'
					: `slot="${name}"`,
	},
	solid: {
		profile: SolidProfile,
		exportName: (name) => name,
		property: (name) => name,
		event: (name) => name,
		slot: (name) => resolveSlotName(name, 'children'),
	},
	svelte: {
		profile: SvelteProfile,
		exportName: (name) => name,
		property: (name) => name,
		event: (name) => name,
		slot: (name, scoped) =>
			/^[A-Za-z_$][\w$]*$/.test(name)
				? `{#snippet ${resolveSlotName(name, 'children')}(${scoped ? 'scope' : ''})}`
				: `${name}={content}`,
	},
	webc: {
		profile: WebcProfile,
		exportName: (name) => `T${name}Element`,
		property: (name) => name,
		event: (name) => `addEventListener('${name}', handler)`,
		slot: (name) => (name === 'default' ? '(unnamed slot)' : `slot="${name}"`),
	},
}

import type { IAdapterProfile, IComponentDescriptor, IPluginDefinition } from '@soxa-ui/setup'

export type TFramework = 'vue' | 'react' | 'angular' | 'solid' | 'svelte' | 'webc'
export type TSourceRole = 'descriptor' | 'facade' | 'ownerFacade'

export type TManifest = {
	id: string
	name: string
	file: string
	sources: { role: TSourceRole; name: string; descriptor: IComponentDescriptor }[]
}

export type TFrameworkSpec = {
	profile: IAdapterProfile
	exportName(name: string): string
	property(name: string): string
	event(name: string): string
	slot(name: string, scoped: boolean): string
}

export type TMemberType = {
	type: string
	declaredType?: string
	values?: (string | number)[]
	required: boolean
	description?: string
}

export type TContractTypes = {
	props: Map<string, TMemberType>
	events: Map<string, TMemberType>
	slots: Map<string, Map<string, TMemberType>>
}

export type TPlugin = { name: string; definition: IPluginDefinition }

export type TProp = TMemberType & {
	name: string
	canonicalName: string
	hasDefault: boolean
	default?: string
}

export type TEvent = { name: string; type: string; description?: string }
export type TSlot = {
	name: string
	description?: string
	scope: Record<string, TMemberType>
}

export type TBindings = {
	props: Record<string, string>
	events: Record<string, string>
	models: Record<string, string>
	slots: Record<string, { name: string; syntax: string }>
}

export type TContract = {
	source: string
	props: TProp[]
	events: TEvent[]
	slots: TSlot[]
	frameworks: Record<TFramework, TBindings>
}

export type TComponent = {
	id: string
	name: string
	contract: string
	sources: { role: TSourceRole; descriptor: string; source: string }[]
	frameworks: Partial<Record<TFramework, { exportName: string; selector?: string }>>
}

export type TApi = {
	schemaVersion: 1
	typeContext: 'library-without-theme'
	components: TComponent[]
	contracts: Record<string, TContract>
	plugins: Record<string, TContract>
}

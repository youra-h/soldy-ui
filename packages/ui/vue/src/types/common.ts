import type { IEntity } from '@soxa-ui/core'
import type { IComponentDescriptor, DescriptorComponentProps } from '@soxa-ui/setup'

export type TEmits = readonly string[]
export type TProps = Readonly<Record<string, unknown>>

/** Props компонента, выведенные из дескриптора: UseProps<typeof ButtonDescriptor, IButton> → ButtonProps */
export type UseProps<
	TDescriptorFn extends (...args: any[]) => IComponentDescriptor,
	TInstance extends IEntity = IEntity,
> = DescriptorComponentProps<TDescriptorFn, TInstance>

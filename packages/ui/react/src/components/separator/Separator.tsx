import type { ElementType, ReactElement } from 'react'
import { toRootProps } from '../../adapter'
import { useSetupSeparator } from './setup.component'
import type { SeparatorProps } from './base.component'

export function Separator(props: SeparatorProps): ReactElement | null {
	const { ref, forwardProps, state } = useSetupSeparator(props)

	const { rendered, tag, attrs, aria, dataset } = state

	if (!rendered) return null

	const Tag = tag as ElementType

	return <Tag {...toRootProps(ref, state, [attrs, aria, dataset], forwardProps)} />
}

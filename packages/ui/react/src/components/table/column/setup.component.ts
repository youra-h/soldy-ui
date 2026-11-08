import { TableColumnDescriptor } from '@soxa-ui/setup'
import { useComponent } from '../../../adapter'
import type { TableColumnProps } from './base.component'

export function useSetupTableColumn(props: TableColumnProps) {
	const binding = useComponent(
		(create) => create(TableColumnDescriptor(), { ctrl: props.ctrl, props }),
		props,
	)

	return { ...binding, column: binding.ctrl }
}

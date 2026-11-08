import { useEmits, useProps } from '../../../adapter'
import type { TEmits, TProps, UseProps } from '../../../types/common'
import { TableColumnDescriptor } from '@soxa-ui/setup'
import type { ITableColumn } from '@soxa-ui/core'

export const emitsTableColumn: TEmits = useEmits(TableColumnDescriptor())

export const propsTableColumn: TProps = useProps(TableColumnDescriptor()) as TProps

export type TableColumnProps = UseProps<typeof TableColumnDescriptor, ITableColumn>

export default {
	name: 'BaseTableColumn',
	emits: emitsTableColumn,
	props: propsTableColumn,
}

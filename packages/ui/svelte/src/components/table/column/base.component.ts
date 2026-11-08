import type { ITableColumn } from '@soxa-ui/core'
import type { TableColumnDescriptor } from '@soxa-ui/setup'
import type { EventProps, UseDomProps } from '../../../types'

export type TableColumnEventProps = EventProps<typeof TableColumnDescriptor>

/** Входов нет: колонки задаются данными таблицы (`columns`). */
export type TableColumnProps = UseDomProps<
	typeof TableColumnDescriptor,
	ITableColumn,
	TableColumnEventProps
>

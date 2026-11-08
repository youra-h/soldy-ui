import type { ITableColumn } from '@soxa-ui/core'
import type { TableColumnDescriptor } from '@soxa-ui/setup'
import type { EventProps, UseDomProps } from '../../../types'

/** События заголовка колонки. */
export type TableColumnEventProps = EventProps<typeof TableColumnDescriptor>

/** Пропсы заголовка колонки: входов нет — колонки задаются данными таблицы. */
export type TableColumnProps = UseDomProps<
	typeof TableColumnDescriptor,
	ITableColumn,
	TableColumnEventProps
>

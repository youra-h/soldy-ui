import type { ITableColumn } from '@soxa-ui/core'
import type { TableColumnDescriptor } from '@soxa-ui/setup'
import type { EventProps, UseDomProps } from '../../../types'

export type TableColumnEventProps = EventProps<typeof TableColumnDescriptor>

/** Пропсы заголовка колонки: входов нет, рисует таблица над `ctrl`. */
export type TableColumnProps = UseDomProps<
	typeof TableColumnDescriptor,
	ITableColumn,
	TableColumnEventProps
>

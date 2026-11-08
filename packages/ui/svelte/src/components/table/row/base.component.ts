import type { ITableRow } from '@soxa-ui/core'
import type { TableCollectionRowDescriptor, TableRowDescriptor } from '@soxa-ui/setup'
import type { EventProps, UseDomProps } from '../../../types'

export type TableRowEventProps = EventProps<typeof TableRowDescriptor> &
	EventProps<typeof TableCollectionRowDescriptor>

/** Входов нет: строку рисует таблица над её экземпляром (`ctrl`). */
export type TableRowProps = UseDomProps<typeof TableRowDescriptor, ITableRow, TableRowEventProps>

import type { ITable } from '@soxa-ui/core'
import type { TableCollectionDescriptor, TableDescriptor } from '@soxa-ui/setup'
import type { EventProps, UseDomProps } from '../../types'

/** События Table — свои и фасада коллекции строк. */
export type TableEventProps = EventProps<typeof TableDescriptor> &
	EventProps<typeof TableCollectionDescriptor>

/** Пропсы Table: класс, стиль и `ref` — окну, остальное — `table`. */
export type TableProps = UseDomProps<typeof TableDescriptor, ITable, TableEventProps>

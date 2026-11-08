import { withParts } from '@soxa-ui/setup'
import TableComponent from './Table.svelte'
import { TableColumn } from './column'
import { TableRow } from './row'

export * from './base.component'
export { setupTable } from './setup.component'
export * from './column'
export * from './row'

export const Table = withParts(TableComponent, { Column: TableColumn, Row: TableRow })

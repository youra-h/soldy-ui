import { Table, Virtual } from '@soxa-ui/react'
import type { TRec } from '../data'
import { columns, tableProps, virtual, width } from '../soxa-setup'

export { sel } from '../soxa-setup'

/** Таблица soxa на адаптере React — те же колонки, флаги и обёртки, что у Vue. */
export function Bench({ rows }: { rows: TRec[] }) {
	const table = <Table items={rows.map((data) => ({ data }))} columns={columns} {...tableProps} />
	const body = virtual ? (
		<div className="bench-scroll" style={{ height: 800, overflow: 'auto' }}>
			<Virtual>{table}</Virtual>
		</div>
	) : (
		table
	)

	return width ? <div style={{ width }}>{body}</div> : body
}

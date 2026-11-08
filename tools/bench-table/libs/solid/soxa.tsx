import { Table, Virtual } from '@soxa-ui/solid'
import type { TRec } from '../data'
import { columns, tableProps, virtual, width } from '../soxa-setup'

export { sel } from '../soxa-setup'

/** Таблица soxa на адаптере Solid — те же колонки, флаги и обёртки, что у Vue. */
export function Bench(props: { rows: TRec[] }) {
	const table = () => (
		<Table items={props.rows.map((data) => ({ data }))} columns={columns} {...tableProps} />
	)
	const body = () =>
		virtual ? (
			<div class="bench-scroll" style={{ height: '800px', overflow: 'auto' }}>
				<Virtual>{table()}</Virtual>
			</div>
		) : (
			table()
		)

	return width ? <div style={{ width: `${width}px` }}>{body()}</div> : body()
}

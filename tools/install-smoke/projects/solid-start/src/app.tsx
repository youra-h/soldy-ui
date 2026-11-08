import { createSignal } from 'solid-js'
import { Button, DatePicker, Dialog, Input, Select, Table } from '@soxa-ui/solid'
import { useIcons, useTheme } from '@soxa-ui/setup'
import * as material from '@soxa-ui/icons-material'
import oren from '@soxa-ui/theme-oren/setup'

import '@soxa-ui/theme-oren'

// The registries are global: filled once per process, on the server too, not
// once per request
useIcons(material)
useTheme(oren)

const cities = [
	{ value: 'kzn', text: 'Kazan' },
	{ value: 'msk', text: 'Moscow' },
	{ value: 'oms', text: 'Omsk' },
]

const columns = [
	{ field: 'name', text: 'Name', rowHeader: true },
	{ field: 'age', text: 'Age', align: 'end' as const },
]

const rows = [{ data: { name: 'Anna', age: 30 } }, { data: { name: 'Boris', age: 41 } }]

export default function App() {
	const [open, setOpen] = createSignal(false)

	return (
		<main>
			<Button text="Open dialog" variant="accent" onClick={() => setOpen(true)} />
			<Dialog
				visible={open()}
				onChangeVisible={({ newValue }) => setOpen(newValue)}
				title="Settings"
			>
				<p>Dialog content</p>
			</Dialog>
			<Input placeholder="Name" aria_label="Name" />
			<Select placeholder="City" aria_label="City" items={cities} />
			<Table aria_label="Staff" columns={columns} items={rows} />
			<DatePicker aria_label="Date" />
			{false && (
				// @ts-expect-error `disabled` is a boolean: the adapter's types reach the project
				<Button disabled="yes" />
			)}
		</main>
	)
}

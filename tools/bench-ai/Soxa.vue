<script setup lang="ts">
import { ref } from 'vue'
import { DatePicker, Dialog, Input, LocaleProvider, Select, Table, Tabs } from '@soxa-ui/vue'
import { enUS, ruRU, arEG } from '@soxa-ui/plugins'
import './setup.mjs'
import '@soxa-ui/theme-oren'

defineOptions({ name: 'SoxaBenchmarkBaseline' })
defineProps(['component', 'items', 'rows', 'locale', 'dir'])
const shown = ref(false)
const date = ref('2026-11-09')
const columns = [
	{ field: 'name', text: 'Name', sortable: true, rowHeader: true },
	{ field: 'score', text: 'Score', sortable: true },
]
const locales = { en: enUS, ru: ruRU, ar: arEG }
</script>

<template>
	<LocaleProvider :locale="locales[locale]">
		<Select
			v-if="component === 'select'"
			:items="items"
			mode="multiple"
			editable
			editable-mode="filter"
			aria_label="Choose items"
		/>
		<template v-else-if="component === 'date-picker'">
			<DatePicker v-model:value="date" aria_label="Choose date" />
			<output aria-label="Selected date">{{ date }}</output>
		</template>
		<template v-else-if="component === 'dialog'">
			<button type="button" @click="shown = true">Open dialog</button>
			<Dialog v-model:visible="shown">
				<template #title>Settings</template>
				<Input aria_label="Name" />
				<template #footer>
					<button type="button" @click="shown = false">Cancel</button>
					<button type="button" @click="shown = false">Save</button>
				</template>
			</Dialog>
		</template>
		<Tabs v-else-if="component === 'tabs'" aria_label="Sections">
			<Tabs.Item
				v-for="(label, i) in ['Alpha', 'Beta', 'Gamma']"
				:key="label"
				:value="label"
				:text="label"
				:active="i === 0"
			/>
			<template #content>
				<Tabs.Content
					v-for="label in ['Alpha', 'Beta', 'Gamma']"
					:key="label"
					:value="label"
					>{{ label }} panel</Tabs.Content
				>
			</template>
		</Tabs>
		<Table
			v-else-if="component === 'table'"
			:items="rows.map((data) => ({ data }))"
			:columns="columns"
			mode="multiple"
			aria_label="Records"
		/>
	</LocaleProvider>
</template>

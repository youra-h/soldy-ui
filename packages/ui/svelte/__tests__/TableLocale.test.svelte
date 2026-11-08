<script lang="ts">
	/**
	 * Тестовая обёртка: таблица под провайдером локали. Имя кнопки сортировки и
	 * чекбокса «выбрать все» плагины имён собирают из строк локали поддерева.
	 */
	import type { TLocale } from '@soxa-ui/plugins'
	import { LocaleProvider, Table, type TableProps } from '@soxa-ui/svelte'

	type THarnessProps = {
		locale: TLocale
		table: TableProps
	}

	const props: THarnessProps = $props()
</script>

<LocaleProvider locale={props.locale}>
	<Table {...props.table} />
</LocaleProvider>

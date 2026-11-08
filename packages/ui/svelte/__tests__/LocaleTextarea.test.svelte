<script lang="ts">
	/**
	 * Тестовая обёртка: многострочное поле со счётчиком под провайдером
	 * локали. Текст счётчика плагин имён пишет по шаблону локали
	 * (`textarea.counter`), а числа — по её тегу.
	 */
	import type { TLocale } from '@soxa-ui/plugins'
	import { LocaleProvider, Textarea } from '@soxa-ui/svelte'

	type THarnessProps = {
		locale: TLocale
		value?: string
		maxlength?: number
	}

	const props: THarnessProps = $props()
</script>

<LocaleProvider locale={props.locale}>
	<Textarea value={props.value} maxlength={props.maxlength} counter />
</LocaleProvider>

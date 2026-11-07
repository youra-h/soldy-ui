<script lang="ts">
import SetupTextarea from './setup.component'

export default { ...SetupTextarea }
</script>

<template>
	<component
		ref="rootElement"
		:is="tag"
		v-if="rendered"
		v-show="visible"
		:class="classes"
		v-bind="{ ...attrs, ...dataset, ...containerAttrs }"
	>
		<!--
			The root follows tag (div by default), as in Input. Size and variant are
			classes; readonly, required, disabled, invalid and limit are dataset entries.
			The limit is reached at maxlength and exceeded above it. The theme reads
			the root to style the frame and counter; ARIA belongs to the inner textarea.
		-->
		<!--
			Поле без класса, как `<input>` у Input. Нативные атрибуты — `id`,
			`name`, `rows`, `maxlength`, `disabled`, `readonly`, `required`,
			`placeholder`; `aria` и атрибуты потребителя — сюда же. Высоту
			тема не задаёт: её ведут `rows`, ручка и плагин автороста —
			инлайновой `height` на этом узле.
		-->
		<textarea
			:id="id"
			:value="value"
			:name="name"
			:rows="rows"
			:maxlength="maxlength"
			:disabled="disabled"
			:readonly="readonly"
			:required="required"
			:placeholder="placeholder"
			v-bind="{ ...aria, ...controlAttrs }"
		></textarea>
		<!--
			Счётчик символов — только при `counter`. Стоит в рамке, под полем:
			подсказка и ошибка `Field` встают под всем компонентом. Текст —
			набрано и предел (`12 / 200`), без `maxlength` — одно число (`12`);
			его пишет плагин имён по локали поддерева. Набор `counterAria` несёт
			`id` счётчика: поле ссылается на него `aria-describedby`, и текст
			звучит на фокусе поля, а не живым регионом на каждый символ.
		-->
		<div v-if="counter" class="so-textarea__counter" v-bind="counterAria">
			{{ names_counter }}
		</div>
	</component>
</template>

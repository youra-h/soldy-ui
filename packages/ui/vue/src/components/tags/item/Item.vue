<script lang="ts">
import { Icon } from '../../icon'
import { Button } from '../../button'
import { ItemRow } from '../../item-row'
import SetupTagsItem from './setup.component'

/**
 * The root contains the row and its remove button. Core supplies rootAria
 * for list semantics without selection and aria for the selectable row.
 * The close button stays outside the option so its label cannot enter the
 * option's accessible name or become presentational. Dataset and styling
 * remain on the root; ItemRow owns neither a role nor a tab stop of its own.
 */
export default { ...SetupTagsItem, components: { Icon, Button, ItemRow } }
</script>

<template>
	<component
		ref="rootElement"
		:is="tag"
		v-if="rendered"
		v-show="visible"
		:class="classes"
		:style="{ order: order }"
		v-bind="{ ...rootAria, ...dataset, ...containerAttrs, ...attrs }"
	>
		<ItemRow
			embedded="tags.row"
			tag="div"
			:direction="direction"
			:disabled="disabled"
			:size="size"
			:variant="variant"
			@action:press="context?.adapters.selection.toggle()"
			v-bind="{ ...aria, ...controlAttrs }"
		>
			<template #leading>
				<slot name="leading" />
			</template>

			<slot :text="text" :selected="selected">
				{{ text }}
			</slot>

			<template #trailing>
				<slot name="trailing" />
			</template>
		</ItemRow>

		<!--
			Кнопка закрытия — сосед строки, а не её часть. В режиме выбора
			строка — `role="option"`: потомки опции для скринридера
			презентационны, а имя опции считается из содержимого. Внутри строки
			крестик не был кнопкой, и его подпись приклеивалась к названию тега:
			«Настройки Close Настройки».

			Имя кнопки приходит из ядра вместе с текстом тега («Close Настройки»).
			Без него у кнопки нет имени вообще, а с одним лишь «Close» все кнопки
			набора неразличимы в списке элементов скринридера.

			В том же наборе `closeAria` приходит `tabindex`: с выбором кнопка из
			порядка Tab выведена (`-1`) — внутри listbox второй остановки быть не
			должно, тег закрывает Delete; без выбора атрибута нет, и нативная
			кнопка остаётся остановкой — иначе тег с клавиатуры не закрыть.

			`size` и `disabled` — явно: от строки кнопка их больше не наследует.
			От размера зависит кегль, от кегля — иконка; выключенный тег
			выключает и свою кнопку. Место рядом со строкой держит тема
			(`.so-tags-item`).
		-->
		<Button
			v-if="tag_closable"
			embedded="tags.close"
			type="button"
			class="so-tags-item__close"
			:disabled="disabled"
			:size="size"
			@click.stop="context?.adapters?.tags?.close()"
			v-bind="closeAria"
		>
			<slot name="close-icon">
				<Icon embedded="tags.close-icon" :tag="closeIconTag" :size="size" />
			</slot>
		</Button>
	</component>
</template>

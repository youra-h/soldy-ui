<script lang="ts">
import SetupSlider from './setup.component'

export default { ...SetupSlider }
</script>

<template>
	<component
		ref="rootElement"
		:is="tag"
		v-if="rendered"
		v-show="visible"
		:class="classes"
		v-bind="{ ...attrs, ...rootAria, ...dataset }"
	>
		<!--
			Slider renders thumbs, fill and marks on a rail. The root follows tag
			(span by default), and its children are spans so it can live inside Label.
			Orientation, tooltip policy, size and variant use --orientation-*,
			--tooltip-*, --size-* and --variant-* classes. States use dataset; dir uses
			attrs. Pointer and keyboard plugins handle input rather than markup.

			For multiple thumbs rootAria names and describes the field group, including
			Field associations. For one thumb the accessible name belongs to its input.
			Thumbs and marks are markup, not separately addressable components. Core
			provides their computed positions as CSS variables and states as datasets.
		-->

		<!--
			Дорожка — ход центров ручек: 0 % и 100 % значения — края её коробки
			по оси, её мерит плагин указателя. Рельс рисует тема псевдоэлементом,
			своего узла у него нет.
		-->
		<span class="so-slider__track">
			<!--
				Заливка — одна на ползунок: от начала или от `origin` до ручки, у
				нескольких ручек — между крайними. Края приходят переменными
				(`--so-slider-range-start`, `--so-slider-range-end`).
			-->
			<span class="so-slider__range" :style="rangeStyle"></span>

			<!--
				Метки — только если они заданы: точками шкалы или списком. Каждая
				метка — позиция в `style` (`--so-slider-position`) и состояния
				`data-in-range` и `data-current`. Блок — под `aria-hidden`, как
				подсказка: подписи меток — зрительная шкала, значение и границы
				объявляет поле, а в подписи `Label` их текст вошёл бы в имя поля.
			-->
			<span v-if="shownMarks.length > 0" class="so-slider__marks" aria-hidden="true">
				<span
					v-for="(mark, index) in shownMarks"
					:key="index"
					class="so-slider__mark"
					:style="mark.style"
					v-bind="mark.dataset"
				>
					<!--
						Подпись — слот `mark` со scope метки, по умолчанию — её
						`label`. Вокруг слота и запасной подписи нет пробелов:
						пустую подпись тема прячет по `:empty`, и метка остаётся
						одной точкой.
					-->
					<span class="so-slider__mark-label"
						><slot name="mark" :value="mark.value" :label="mark.label">{{
							mark.label
						}}</slot></span
					>
				</span>
			</span>

			<!--
				Ручка — по одной на значение: позиция в `style`
				(`--so-slider-position`), состояние `data-dragging`. Подсказка со
				значением — внутри ручки, поэтому едет за ней сама.
			-->
			<span
				v-for="(thumb, index) in thumbs"
				:key="index"
				class="so-slider__thumb"
				:style="thumb.style"
				v-bind="thumb.dataset"
			>
				<!--
					Нативное поле — по одному в ручке. Мобильные скринридеры
					двигают его своим жестом, `name`, `disabled` и отправку формы
					даёт браузер, ARIA-дублей ему нет. Ход поля — соседи и зазор,
					шаг — шкалы (`any` у списка). Набор поля ядро отдаёт целиком
					(`thumb.aria`): у одной ручки — весь `aria` ползунка (имя,
					описание, ориентация, ошибка и `id` от поля формы), у
					нескольких — ориентация и ошибка, а имя и описание — у
					корня-группы; имя ручки из `thumbLabels` в нём уже сильнее.
					Тема делает поле прозрачным во всю ручку и не пускает к нему
					указатель: тянет плагин, а не браузер.
				-->
				<input
					class="so-slider__input"
					type="range"
					:min="thumb.min"
					:max="thumb.max"
					:step="thumb.step"
					:value="thumb.value"
					:name="name"
					:disabled="disabled"
					v-bind="thumb.aria"
				/>
				<!--
					Подсказка со значением — только когда она включена
					(`tooltip`): рисовать ли, решает ядро (`tooltipRendered`),
					когда показывать в `auto` — тема. Под `aria-hidden`: значение
					объявляет поле, а в подписи `Label` текст подсказки вошёл бы в
					имя поля. Содержимое — слот `thumb` со scope ручки, по
					умолчанию — её значение. Вокруг слота и запасного текста нет
					пробелов, как у подписи метки: в тексте подсказки остались бы
					пробелы по краям.
				-->
				<span v-if="tooltipRendered" class="so-slider__tooltip" aria-hidden="true"
					><slot name="thumb" :value="thumb.value" :index="index">{{
						thumb.value
					}}</slot></span
				>
			</span>
		</span>
	</component>
</template>

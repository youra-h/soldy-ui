<script lang="ts">
import SetupProgressLinear from './setup.component'

export default { ...SetupProgressLinear }
</script>

<template>
	<component
		ref="rootElement"
		:is="tag"
		v-if="rendered"
		v-show="visible"
		:class="classes"
		:style="percentStyle"
		v-bind="{ ...attrs, ...aria, ...dataset }"
	>
		<!--
			Linear progress uses orientation, size and variant classes on the root.
			Core exposes --orientation-horizontal or --orientation-vertical, the
			percentage through --so-progress-linear-percent, and running state through
			data-indeterminate. The theme draws the track, fill and indeterminate motion.
		-->

		<!--
			Заливка — доля готового от начала строки, в RTL — справа, у
			вертикальной полосы — снизу. Длина — из переменной на корне. Пока
			полоса бежит, заливку тема прячет, а бег рисует псевдоэлементом корня:
			своего узла у бегущего отрезка нет.
		-->
		<span class="so-progress-linear__range"></span>
	</component>
</template>

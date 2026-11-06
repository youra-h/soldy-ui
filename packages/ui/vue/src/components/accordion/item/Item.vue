<script lang="ts">
import { Icon } from '../../icon'
import { Button } from '../../button'
import SetupAccordionItem from './setup.component'

export default { ...SetupAccordionItem, components: { Icon, Button } }
</script>

<template>
	<component
		ref="rootElement"
		:is="tag"
		v-if="rendered"
		v-show="visible"
		:class="classes"
		:style="{ order: order }"
		v-bind="{ ...dataset, ...containerAttrs, ...attrs }"
	>
		<!--
			The item adapter provides the header and panel linkage: `aria-controls`
			and the panel `id` share one identifier.

			The wrapper has no role, so its state is `data-selected` for the theme.
			The core supplies `dataset` for the wrapper and `aria` for the header.

			The arrow class belongs to its wrapper. The theme rotates that wrapper,
			so a custom `arrow-icon` rotates like the default icon. The wrapper
			appears only at the edge selected by `arrowPlacement`.
		-->
		<Button
			embedded="accordion.header"
			type="button"
			class="so-accordion-item__header"
			:view="view"
			:disabled="disabled"
			:size="size"
			:variant="variant"
			@click="context?.adapters.selection.toggle()"
			v-bind="{ ...aria, ...controlAttrs }"
		>
			<template #leading>
				<span v-if="arrowPlacement === 'start'" class="so-accordion-item__arrow">
					<slot name="arrow-icon" :item="ctrl">
						<Icon
							embedded="accordion.arrow"
							v-if="arrowPlacement === 'start'"
							:tag="arrowIconTag"
							:size="size"
						/>
					</slot>
				</span>
				<slot name="leading" :item="ctrl" />
			</template>

			<slot name="header" :item="ctrl" :text="text" :selected="selected">
				{{ text }}
			</slot>

			<template #trailing>
				<slot name="trailing" :item="ctrl" />
				<span v-if="arrowPlacement === 'end'" class="so-accordion-item__arrow">
					<slot name="arrow-icon" :item="ctrl">
						<Icon
							embedded="accordion.arrow"
							v-if="arrowPlacement === 'end'"
							:tag="arrowIconTag"
							:size="size"
						/>
					</slot>
				</span>
			</template>
		</Button>

		<div class="so-accordion-item__body">
			<div class="so-accordion-item__content" v-bind="contentAria">
				<slot :item="ctrl" />
			</div>
		</div>
	</component>
</template>

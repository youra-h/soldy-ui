<script lang="ts">
import { ItemRow } from '../../item-row'
import SetupBreadcrumbsOverflowItem from './setup.component'

export default {
	...SetupBreadcrumbsOverflowItem,
	components: { ItemRow },
}
</script>
<template>
	<component
		ref="rootElement"
		:is="tag"
		v-if="rendered"
		v-show="visible"
		:class="classes"
		v-bind="{ ...dataset, ...containerAttrs, ...attrs }"
	>
		<ItemRow
			embedded="menu.row"
			tag="a"
			:size="size"
			:disabled="disabled"
			@click="!$event.defaultPrevented && context?.adapters.menu.choose()"
			v-bind="{ ...aria, ...controlAttrs }"
		>
			<template #leading>
				<span class="so-menu-item__icon"><slot name="leading" /></span>
			</template>

			<slot :text="text">{{ text }}</slot>

			<template #trailing>
				<span class="so-menu-item__shortcut"><slot name="trailing" /></span>
			</template>
		</ItemRow>
	</component>
</template>

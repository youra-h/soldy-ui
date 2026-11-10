<script lang="ts">
import { ItemRow } from '../../item-row'
import { Menu } from '../../menu'
import { Button } from '../../button'
import { BreadcrumbsOverflowItem } from '../overflow-item'
import SetupBreadcrumbsItem from './setup.component'

export default {
	...SetupBreadcrumbsItem,
	components: { ItemRow, Menu, Button, BreadcrumbsOverflowItem },
}
</script>
<template>
	<component
		ref="rootElement"
		:is="tag"
		v-if="rendered"
		v-show="visible && breadcrumbs_shown"
		:class="classes"
		:style="{ order }"
		v-bind="{ ...dataset, ...containerAttrs }"
	>
		<span
			v-if="breadcrumbs_separator"
			class="so-breadcrumbs__separator"
			aria-hidden="true"
		></span>
		<ItemRow
			embedded="breadcrumbs.row"
			tag="a"
			class="so-breadcrumbs__link"
			:size="size"
			:variant="variant"
			:disabled="disabled"
			v-bind="{ ...attrs, ...aria, ...controlAttrs }"
		>
			<template #leading><slot name="leading" /></template>
			<slot :text="text" :active="active">{{ text }}</slot>
			<template #trailing><slot name="trailing" /></template>
		</ItemRow>
		<template v-if="breadcrumbs_menu">
			<span class="so-breadcrumbs__separator" aria-hidden="true"></span>
			<Menu
				embedded="breadcrumbs.menu"
				:ctrl="breadcrumbs_menu"
				class="so-breadcrumbs__overflow"
			>
				<template #trigger="{ triggerAria, triggerDataset }">
					<Button
						embedded="breadcrumbs.trigger"
						type="button"
						class="so-breadcrumbs__trigger"
						:size="size"
						v-bind="{ ...triggerAria, ...triggerDataset, ...breadcrumbs_overflowAria }"
						>&#8230;</Button
					>
				</template>
				<BreadcrumbsOverflowItem
					v-for="entry in breadcrumbs_overflowEntries"
					:key="entry.item.uid"
					:ctrl="entry.menuItem"
					v-bind="entry.item.attrs.toObject()"
				>
					{{ entry.item.text }}
				</BreadcrumbsOverflowItem>
			</Menu>
		</template>
	</component>
</template>

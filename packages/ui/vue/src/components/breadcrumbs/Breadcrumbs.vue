<script lang="ts">
import { Menu } from '../menu'
import { Button } from '../button'
import BreadcrumbsOverflowItem from './OverflowItem.vue'
import SetupBreadcrumbs from './setup.component'
export default { ...SetupBreadcrumbs, components: { Menu, Button, BreadcrumbsOverflowItem } }
</script>
<template>
	<component
		ref="rootElement"
		:is="tag"
		v-if="rendered"
		v-show="visible"
		:class="classes"
		v-bind="{ ...attrs, ...aria, ...dataset }"
	>
		<ol class="so-breadcrumbs__list">
			<template v-for="(entry, position) in entries" :key="entry.index">
				<li v-if="position === 1 && hiddenEntries.length" class="so-breadcrumbs__item">
					<span class="so-breadcrumbs__separator" aria-hidden="true"></span>
					<Menu
						embedded="breadcrumbs.menu"
						:ctrl="menu"
						:size="size"
						:variant="variant"
						class="so-breadcrumbs__overflow"
					>
						<template #trigger="{ triggerAria, triggerDataset }">
							<Button
								embedded="breadcrumbs.trigger"
								type="button"
								class="so-breadcrumbs__trigger"
								:size="size"
								v-bind="{ ...triggerAria, ...triggerDataset, ...overflowAria }"
								>…</Button
							>
						</template>
						<BreadcrumbsOverflowItem
							v-for="hidden in hiddenEntries"
							:key="hidden.index"
							:text="hidden.item.text"
							:disabled="hidden.item.href === undefined"
							v-bind="hidden.attrs"
							:data-breadcrumb-index="hidden.index"
						>
							<template #leading
								><slot
									name="item-leading"
									:item="hidden.item"
									:index="hidden.index"
									:current="hidden.current"
							/></template>
							<slot
								name="item"
								:item="hidden.item"
								:index="hidden.index"
								:current="hidden.current"
								>{{ hidden.item.text }}</slot
							>
							<template #trailing
								><slot
									name="item-trailing"
									:item="hidden.item"
									:index="hidden.index"
									:current="hidden.current"
							/></template>
						</BreadcrumbsOverflowItem>
					</Menu>
				</li>
				<li class="so-breadcrumbs__item">
					<span
						v-if="position > 0"
						class="so-breadcrumbs__separator"
						aria-hidden="true"
					></span>
					<component
						:is="entry.item.href === undefined ? 'span' : 'a'"
						class="so-breadcrumbs__link"
						v-bind="{ ...entry.attrs, ...entry.aria, ...entry.dataset }"
					>
						<slot
							name="item-leading"
							:item="entry.item"
							:index="entry.index"
							:current="entry.current"
						/>
						<slot
							name="item"
							:item="entry.item"
							:index="entry.index"
							:current="entry.current"
							>{{ entry.item.text }}</slot
						>
						<slot
							name="item-trailing"
							:item="entry.item"
							:index="entry.index"
							:current="entry.current"
						/>
					</component>
				</li>
			</template>
		</ol>
	</component>
</template>

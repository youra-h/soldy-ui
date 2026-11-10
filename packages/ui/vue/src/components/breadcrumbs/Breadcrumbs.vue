<script lang="ts">
import { BreadcrumbsItem } from './item'
import SetupBreadcrumbs from './setup.component'
export default { ...SetupBreadcrumbs, components: { BreadcrumbsItem } }
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
			<slot>
				<template v-for="item in shown" :key="item.uid">
					<BreadcrumbsItem
						v-if="!($slots.item || $slots['item-leading'] || $slots['item-trailing'])"
						:ctrl="item"
					/>
					<BreadcrumbsItem v-else :ctrl="item">
						<template #leading><slot name="item-leading" :item="item" /></template>
						<template #default="{ text, active }"
							><slot name="item" :item="item" :text="text" :active="active">{{
								text
							}}</slot></template
						>
						<template #trailing><slot name="item-trailing" :item="item" /></template>
					</BreadcrumbsItem>
				</template>
			</slot>
		</ol>
	</component>
</template>

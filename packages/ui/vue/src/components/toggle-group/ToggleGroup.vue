<script lang="ts">
import { ToggleGroupItem } from './item'
import SetupToggleGroup from './setup.component'
export default { ...SetupToggleGroup, components: { ToggleGroupItem } }
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
		<slot>
			<template v-for="item in shown" :key="item.uid">
				<ToggleGroupItem
					v-if="!($slots.item || $slots['item-leading'] || $slots['item-trailing'])"
					:ctrl="item"
				/>
				<ToggleGroupItem v-else :ctrl="item">
					<template #leading><slot name="item-leading" :item="item" /></template>
					<template #default="{ text, selected }"
						><slot name="item" :item="item" :text="text" :selected="selected">{{
							text
						}}</slot></template
					>
					<template #trailing><slot name="item-trailing" :item="item" /></template>
				</ToggleGroupItem>
			</template>
		</slot>
	</component>
</template>

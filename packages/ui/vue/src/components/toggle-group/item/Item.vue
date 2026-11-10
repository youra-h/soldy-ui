<script lang="ts">
import SetupToggleGroupItem from './setup.component'

export default { ...SetupToggleGroupItem }
</script>

<template>
	<component
		ref="rootElement"
		:is="tag"
		v-if="rendered"
		v-show="visible"
		:class="classes"
		type="button"
		v-bind="{ ...attrs, ...aria, ...dataset }"
	>
		<slot name="leading"> </slot>
		<span class="so-button__text">
			<slot :text="text" :selected="selected">{{ text }}</slot>
		</span>
		<slot name="trailing"> </slot>
	</component>
</template>

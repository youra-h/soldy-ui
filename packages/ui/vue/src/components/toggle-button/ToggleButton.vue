<script lang="ts">
import SetupToggleButton from './setup.component'

export default { ...SetupToggleButton }
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
			<slot :text="text">{{ text }}</slot>
		</span>
		<slot name="trailing"> </slot>
	</component>
</template>

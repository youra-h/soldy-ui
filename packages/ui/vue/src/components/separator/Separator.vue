<script lang="ts">
import SetupSeparator from './setup.component'

export default { ...SetupSeparator }
</script>

<template>
	<component
		ref="rootElement"
		:is="tag"
		v-if="rendered"
		v-show="visible"
		:class="classes"
		v-bind="{ ...attrs, ...aria, ...dataset }"
	/>
</template>

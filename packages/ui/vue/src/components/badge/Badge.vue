<script lang="ts">
import SetupBadge from './setup.component'
export default { ...SetupBadge }
</script>

<template>
	<component
		ref="rootElement"
		:is="tag"
		v-if="rendered"
		v-show="visible"
		:class="classes"
		v-bind="{ ...attrs, ...dataset }"
	>
		<span class="so-badge__anchor"><slot name="anchor" /></span>
		<span class="so-badge__indicator" v-bind="aria">{{ displayValue }}</span>
	</component>
</template>

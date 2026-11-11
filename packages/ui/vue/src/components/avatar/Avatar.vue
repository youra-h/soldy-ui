<script lang="ts">
import SetupAvatar from './setup.component'
export default { ...SetupAvatar }
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
		<img v-if="status === 'loaded'" class="so-avatar__image" :src="src || undefined" alt="" />
		<span v-else class="so-avatar__fallback" aria-hidden="true"
			><slot name="fallback">{{ initials }}</slot></span
		>
	</component>
</template>

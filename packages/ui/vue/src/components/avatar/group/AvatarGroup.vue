<script lang="ts">
import SetupAvatarGroup from './setup.component'
export default { ...SetupAvatarGroup }
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
		<slot />
		<span v-if="displayOverflow" class="so-avatar-group__overflow"
			><slot name="overflow-content" :count="overflow"
				><span class="so-avatar-group__count">{{ displayOverflow }}</span></slot
			></span
		>
	</component>
</template>

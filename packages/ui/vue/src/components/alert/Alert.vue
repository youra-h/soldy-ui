<script lang="ts">
import { Button } from '../button'
import { Icon } from '../icon'
import SetupAlert from './setup.component'

export default { ...SetupAlert, components: { Button, Icon } }
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
		<span class="so-alert__icon" aria-hidden="true"><slot name="icon" /></span>
		<div class="so-alert__body">
			<div class="so-alert__title"><slot name="title" /></div>
			<div class="so-alert__content"><slot /></div>
		</div>
		<div class="so-alert__action"><slot name="action" /></div>
		<Button
			v-if="closable"
			embedded="alert.close"
			type="button"
			class="so-alert__close"
			v-bind="closeAria"
			@click="alert.hide()"
		>
			<span aria-hidden="true"
				><slot name="close-icon"
					><Icon embedded="alert.close-icon" :tag="closeIconTag" /></slot
			></span>
		</Button>
	</component>
</template>

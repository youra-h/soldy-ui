<script setup lang="ts">
import { Button, Input, Select } from '@soxa-ui/vue'
import ConsumerSmoke from './ConsumerSmoke.vue'
const sizes = ['sm', 'normal', 'lg', 'xl', '2xl'] as const
const cities = [
	{ value: 'kzn', text: 'Kazan' },
	{ value: 'msk', text: 'Moscow' },
]
</script>
<template>
	<ConsumerSmoke />
	<section v-for="size in sizes" :key="size" :data-size="size">
		<Button :size="size" :text="'Button ' + size" />
		<Input :size="size" :aria_label="'Input ' + size" />
		<Select :size="size" :aria_label="'Select ' + size" :items="cities" />
	</section>
	<Button class="rounded-none px-0" text="Utility override" />
	<section id="plain">
		<button>Plain button</button>
		<input aria-label="Plain input" />
		<ul>
			<li>Plain list</li>
		</ul>
		<h1>Plain heading</h1>
	</section>
</template>

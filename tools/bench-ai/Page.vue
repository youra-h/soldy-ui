<script setup lang="ts">
import Candidate from 'bench-candidate'
import { items, rows } from './data.mjs'
defineOptions({ name: 'BenchmarkPage' })
defineProps(['component', 'locale', 'dir', 'count', 'baseline'])
</script>

<template>
	<main :lang="locale" :dir="dir">
		<h1>Component validation</h1>
		<button type="button">Before component</button>
		<section aria-label="Candidate">
			<Candidate
				v-bind="baseline ? { component } : {}"
				:items="items(count >= 10000 ? 10000 : 100)"
				:rows="rows(count)"
				:locale="locale"
				:dir="dir"
			/>
		</section>
		<button type="button">After component</button>
	</main>
</template>

<style>
body {
	font-family: system-ui, sans-serif;
	margin: 16px;
}
section {
	max-width: 100%;
}
</style>

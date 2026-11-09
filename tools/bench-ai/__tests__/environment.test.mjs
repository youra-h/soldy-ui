import test from 'node:test'
import assert from 'node:assert/strict'
import { auditEnvironment } from '../environment.mjs'

test('Vue runtime imports and strings/comments that merely mention imports remain allowed', () => {
	const source = `<script setup lang="ts">import {ref} from 'vue'; import type {Ref} from 'vue'; const text = "import('outside')"; // import('outside')\nconst x = ref(1)</script><template><p>{{ x }}</p></template>`
	assert.equal(auditEnvironment(source).status, 'within-declared-runtime')
})
test('unrelated libraries, local helpers and Node builtins violate the predeclared environment', () => {
	for (const name of ['@soxa-ui/vue', '@headlessui/vue', './helper.js', 'node:fs'])
		assert.equal(
			auditEnvironment(
				`<script setup>import x from '${name}'</script><template><p/></template>`,
			).status,
			'protocol-violation',
		)
})
test('computed imports are rejected and literal Vue subpaths accepted', () => {
	assert.equal(
		auditEnvironment('<script setup>const x = import(name)</script><template><p/></template>')
			.status,
		'protocol-violation',
	)
	assert.equal(
		auditEnvironment(
			'<script setup>const x = import("vue/server-renderer")</script><template><p/></template>',
		).status,
		'within-declared-runtime',
	)
})
test('external SFC blocks cannot borrow dependencies from the repository', () => {
	for (const block of [
		'<script src="./helper.js"/>',
		'<style src="./theme.css"/>',
		'<template src="./template.html"/>',
	])
		assert.equal(auditEnvironment(block).status, 'protocol-violation')
})
test('CSS imports and TypeScript import-equals cannot borrow undeclared dependencies', () => {
	assert.equal(
		auditEnvironment('<template><p/></template><style scoped>@import "./theme.css";</style>')
			.status,
		'protocol-violation',
	)
	assert.equal(
		auditEnvironment(
			'<script setup lang="ts">import x = require("node:fs")</script><template><p/></template>',
		).status,
		'protocol-violation',
	)
})
test('a syntax error remains a compiler finding rather than an invented dependency violation', () => {
	const result = auditEnvironment('<script setup>const x = {{{</script><template><p/></template>')
	assert.equal(result.violations.length, 0)
})

import test from 'node:test'
import assert from 'node:assert/strict'
import { motionSummary, partitionAxe } from '../observations.mjs'

test('unreviewed visual geometry never passes as appearance', () => {
	for (const property of [
		'backgroundPosition',
		'backgroundSize',
		'filter',
		'clipPath',
		'borderRadius',
	]) {
		const result = motionSummary({
			media: true,
			animations: [{ properties: [property], activeDurationMs: 200 }],
		})
		assert.equal(result.status, 'incomplete', property)
	}
	assert.equal(
		motionSummary({
			media: true,
			animations: [{ properties: ['transform'], activeDurationMs: 'infinite' }],
		}).status,
		'movement-observed',
	)
})

test('region without inspected document context remains an actionable best practice', () => {
	const unknown = { id: 'region', tags: ['best-practice'], nodes: [{ target: ['#panel'] }] }
	const result = partitionAxe({ violations: [unknown], incomplete: [] })
	assert.deepEqual(result.documentIntegration, [])
	assert.deepEqual(result.bestPractice, [unknown])
})

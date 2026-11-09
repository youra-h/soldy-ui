import test from 'node:test'
import assert from 'node:assert/strict'
import { classifyCell, groupCauses } from '../classification.mjs'
const context = { participant: 'Soxa', raw: 'saved/results.json' }
test('several causes share a cell without becoming independent bugs', () => {
	const findings = classifyCell(
		{
			status: 'failed',
			component: 'select',
			mode: 'ime',
			failure: 'Unfinished IME Enter must not select an option',
			axe: {
				after: {
					violations: [
						{ id: 'aria-required-children' },
						{ id: 'region' },
						{ id: 'unknown', help: 'Unreviewed rule' },
					],
					incomplete: [{ id: 'contrast' }],
				},
			},
		},
		context,
	)
	assert(findings.some((f) => f.cause === 'select-ime' && f.task))
	assert(findings.some((f) => f.cause === 'select-tags-aria' && f.task))
	assert(findings.some((f) => f.category === 'unreviewed' && f.cause === 'axe-unknown'))
	assert(findings.some((f) => f.category === 'incomplete-check'))
	const groups = groupCauses([...findings, ...findings])
	assert.equal(groups.length, findings.length)
	assert(groups.every((g) => g.observations.length === 2))
	assert.throws(() => groupCauses([{ category: 'confirmed-component-defect' }]))
})
test('negative control requires explicit fixture context; ordinary failure remains unreviewed', () => {
	const cell = { status: 'failed', failure: 'broken' }
	assert.equal(classifyCell(cell, context)[0].category, 'unreviewed')
	assert.equal(
		classifyCell(cell, { ...context, negativeControl: true })[0].category,
		'intentional-negative-control',
	)
	assert.equal(
		classifyCell(
			{
				status: 'failed',
				failure: 'axe violations in recorded states',
				axe: { open: { violations: [{ id: 'aria-required-children' }] } },
			},
			{ ...context, participant: 'candidate' },
		)[0].category,
		'unreviewed',
	)
})

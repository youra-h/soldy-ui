import { describe, expect, it } from 'vitest'
import { SCENARIOS, TScenarioHost, TScenarioRunner } from '@soxa-ui/playground-shared'
import { FRAMEWORKS, loadHost } from '../src/hosts'
import '@soxa-ui/theme-oren'

const components = [
	'alert',
	'badge',
	'breadcrumbs',
	'separator',
	'toggle-button',
	'toggle-group',
	'code-block',
	'avatar',
	'avatar-group',
	'alert-dialog',
]
const cases = SCENARIOS.filter(
	(entry) => components.includes(entry.component) && entry.kind === 'auto',
)

describe.each(FRAMEWORKS)('registered audit scenarios / $id', ({ id }) => {
	it('includes all audited components independently of host availability', () => {
		expect([...new Set(cases.map((entry) => entry.component))].sort()).toEqual(
			[...components].sort(),
		)
	})

	for (const entry of cases)
		it(entry.id, async () => {
			const preview = await loadHost(id)

			expect(preview.previews).toContain(entry.component)
			if (entry.fixture) expect(preview.fixtures).toContain(entry.fixture)

			const scene = document.createElement('div')
			const target = document.createElement('div')

			scene.append(target)
			document.body.append(scene)
			const host = new TScenarioHost(preview)
			const runner = new TScenarioRunner({ host, scenarios: [entry], print: () => {} })

			host.attach(entry.id, { scene, target })

			try {
				await runner.run(entry.id)
				const state = runner.state(entry.id)

				expect(state.checks.length).toBeGreaterThan(0)
				expect(state, JSON.stringify(state)).toMatchObject({ status: 'passed' })
			} finally {
				runner.release([entry.id])
				await host.unmount(entry.id)
				host.detach(entry.id, scene)
				scene.remove()
			}
		})
})

import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { commands, server } from 'vitest/browser'
import axe from 'axe-core'
import { auditGate, validateExceptions, type TAuditException } from './axe/gate'

let scene: HTMLElement
let language: string | null
let title: string
beforeEach(() => {
	language = document.documentElement.getAttribute('lang')
	title = document.title
	document.documentElement.lang = 'en'
	document.title = 'Axe gate regression'
	scene = document.createElement('main')
	document.body.append(scene)
})
afterEach(() => {
	scene.remove()
	document.title = title
	if (language === null) document.documentElement.removeAttribute('lang')
	else document.documentElement.lang = language
})
const context = { browser: server.browser, adapter: 'vue', case: 'button/named' }

describe('axe severity gate', () => {
	it('rejects a real unnamed button and keeps original nodes/checks', async () => {
		scene.innerHTML = '<button></button>'
		const result = await axe.run(document)
		const before = JSON.stringify(result.violations)
		const gate = auditGate(result.violations, context)
		await commands.saveA11yReport({
			adapter: 'vue',
			case: 'gate/unnamed',
			axe: axe.version,
			violations: result.violations,
			incomplete: result.incomplete,
			gate,
		})
		expect(gate.failures.some((value) => value.rule === 'button-name')).toBe(true)
		expect(JSON.stringify(result.violations)).toBe(before)
		const button = result.violations.find((value) => value.id === 'button-name')
		expect(button?.nodes[0]?.html).toBe('<button></button>')
		expect(button?.nodes[0]?.any.length).toBeGreaterThan(0)
	})
	it('accepts the named consumer with default rules including contrast', async () => {
		scene.innerHTML = '<button>Save changes</button>'
		const result = await axe.run(document)
		const gate = auditGate(result.violations, context)
		await commands.saveA11yReport({
			adapter: 'vue',
			case: 'gate/named',
			axe: axe.version,
			violations: result.violations,
			incomplete: result.incomplete,
			gate,
		})
		expect(gate.failures).toEqual([])
	})
	it('accepts only the exact reproduced node and rejects stale exceptions', async () => {
		scene.innerHTML = '<button id="unnamed"></button>'
		const result = await axe.run(document)
		const finding = result.violations.find((value) => value.id === 'button-name')
		const node = finding?.nodes[0]
		if (!node) throw new Error('Negative control did not produce button-name')
		const exception: TAuditException = {
			browser: server.browser === 'webkit' ? 'webkit' : 'chromium',
			adapter: 'vue',
			case: 'button/named',
			rule: 'button-name',
			selector: '#unnamed',
			reason: 'Temporary regression fixture, not a production exception',
			task: '869fph2rf',
		}
		const gate = auditGate(result.violations, context, [exception])
		expect(gate.waived).toHaveLength(1)
		expect(gate.failures).toEqual([])
		expect(auditGate([], context, [exception]).stale).toEqual([exception])
		scene.innerHTML = '<button id="different"></button>'
		const changed = await axe.run(document)
		expect(auditGate(changed.violations, context, [exception]).failures).not.toEqual([])
		scene.innerHTML = '<button class="ambiguous"></button><button class="ambiguous"></button>'
		expect(() =>
			auditGate(result.violations, context, [{ ...exception, selector: '.ambiguous' }]),
		).toThrow('Ambiguous exception node')
	})
	it('rejects absent reasons, missing tasks and broad node/rule patterns', () => {
		const base: TAuditException = {
			browser: 'chromium',
			adapter: 'vue',
			case: 'button/named',
			rule: 'button-name',
			selector: '#unnamed',
			reason: 'Temporary reproduced defect',
			task: '869fph2rf',
		}
		for (const invalid of [
			{ ...base, reason: '' },
			{ ...base, task: '' },
			{ ...base, selector: '*' },
			{ ...base, rule: '*' },
			{ ...base, case: 'missing/case' },
		])
			expect(() => validateExceptions([invalid])).toThrow()
	})
	it('persists incomplete HTML, targets and checks without filtering', async () => {
		const incomplete = [
			{
				id: 'color-contrast',
				impact: 'serious',
				nodes: [
					{
						target: ['#review'],
						html: '<span id="review">Review contrast</span>',
						any: [{ id: 'color-contrast', data: { messageKey: 'bgImage' } }],
						all: [],
						none: [],
					},
				],
			},
		]
		const saved = await commands.saveA11yReport({
			adapter: 'vue',
			case: 'gate/incomplete',
			axe: axe.version,
			violations: [],
			incomplete,
		})
		const decoded: unknown = JSON.parse(saved)
		expect(decoded).toMatchObject({ incomplete })
	})
	it('rejects report destinations outside the fixed audit inventory', async () => {
		await expect(
			commands.saveA11yReport({ adapter: '../escape', case: 'button/named' }),
		).rejects.toThrow('Unknown audit adapter')
		await expect(
			commands.saveA11yReport({ adapter: 'vue', case: '../../escape' }),
		).rejects.toThrow('Unknown audit case')
	})
})

import { describe, expect, it } from 'vitest'
import {
	type Answer,
	CASES,
	PROTOCOL_VERSION,
	answerKey,
	emptyEnvironment,
	makeReport,
	restoreDraft,
} from '../src/manual-a11y/protocol'

describe('manual accessibility report', () => {
	it('exports every unobserved step as not-run instead of passing it', () => {
		const report = makeReport(
			emptyEnvironment(),
			{},
			{ commit: 'test' },
			'2026-11-09T00:00:00Z',
		)
		expect(report.tests).toHaveLength(9)
		expect(report.counts).toEqual({ 'not-run': 36, passed: 0, failed: 0, unclear: 0 })
		expect(report.completion).toBe('partial')
		expect(report.verdict).toBe('incomplete')
		expect(
			new Set(
				report.tests.flatMap((test) =>
					test.steps.map((step) => answerKey(test.id, step.id)),
				),
			).size,
		).toBe(36)
	})
	it('retains actual speech, findings and environment in their original step', () => {
		const environment = { ...emptyEnvironment(), examiner: 'Tester', browser: 'Chrome' }
		const answers = {
			'dialog/open': { outcome: 'failed' as const, speech: 'Молчит', notes: 'Фокус на фоне' },
			'drawer/open': { outcome: 'unclear' as const, speech: '', notes: 'Режим сканирования' },
		}
		const report = makeReport(
			environment,
			answers,
			{ commit: 'abc123' },
			'2026-11-09T00:00:00Z',
		)
		expect(report.tests[0].steps[0]).toMatchObject(answers['dialog/open'])
		expect(report.counts).toEqual({ 'not-run': 34, passed: 0, failed: 1, unclear: 1 })
		expect(report.verdict).toBe('findings')
		expect(report.source.commit).toBe('abc123')
		expect(report.environment.examiner).toBe('Tester')
		environment.examiner = 'Changed later'
		expect(report.environment.examiner).toBe('Tester')
	})
	it('distinguishes a completed review with unclear steps from a passing review', () => {
		const answers: Record<string, Answer> = Object.fromEntries(
			CASES.flatMap((test) =>
				test.steps.map((step) => [
					answerKey(test.id, step.id),
					{ outcome: 'passed' as const, speech: 'Понятно', notes: '' },
				]),
			),
		)
		expect(makeReport(emptyEnvironment(), answers, {}, '').verdict).toBe('passed-by-examiner')
		answers['dialog/open'].outcome = 'unclear'
		const report = makeReport(emptyEnvironment(), answers, {}, '')
		expect(report.completion).toBe('complete')
		expect(report.verdict).toBe('incomplete')
	})
	it('restores valid answers and ignores unknown step IDs and invalid outcomes', () => {
		const restored = restoreDraft(
			JSON.stringify({
				protocolVersion: PROTOCOL_VERSION,
				activeCase: 'menu',
				environment: { examiner: 'Тест', os: 12 },
				answers: {
					'dialog/open': {
						outcome: 'failed',
						speech: 'Нет названия',
						notes: 'Наблюдение',
					},
					'menu/open': { outcome: 'invented' },
					'unknown/step': { outcome: 'passed' },
				},
			}),
		)
		expect(restored.activeCase).toBe('menu')
		expect(restored.environment.examiner).toBe('Тест')
		expect(restored.environment.os).toBe('')
		expect(Object.keys(restored.answers)).toEqual(['dialog/open'])
		expect(restored.answers['dialog/open'].speech).toBe('Нет названия')
		expect(() => restoreDraft('{broken')).toThrow()
		expect(() => restoreDraft('{"protocolVersion":999}')).toThrow()
	})
})

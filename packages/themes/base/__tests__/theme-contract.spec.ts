import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { collectInventory, collectSource, type TInventory } from './theme-emissions'

const root = resolve(import.meta.dirname, '../../../..')
const contract = JSON.parse(
	readFileSync(resolve(import.meta.dirname, '../theme-contract.json'), 'utf8'),
)
const inventory = collectInventory(root)
const kinds = ['roots', 'parts', 'modifiers', 'data', 'dynamic'] as const

function names(entries: { name: string; sources: string[] }[]) {
	return entries.map(({ name, sources }) => ({ name, sources }))
}

function drift(expected: TInventory, actual: TInventory): string[] {
	return kinds.filter(
		(kind) => JSON.stringify(names(expected[kind])) !== JSON.stringify(names(actual[kind])),
	)
}

function fixture(
	source: string,
	place = 'packages/ui/vue/src/components/button/Button.vue',
): TInventory {
	const result: TInventory = { roots: [], parts: [], modifiers: [], data: [], dynamic: [] }
	collectSource(source, place, result)
	return result
}

describe('published theme contract', () => {
	it('uses prop names for class modifiers and datasets for states', () => {
		for (const entry of inventory.modifiers) expect(entry.name).toMatch(/^--[a-z][a-z-]*-/)
		for (const name of [
			'readonly',
			'required',
			'clearable',
			'editable',
			'open',
			'closable',
			'indeterminate',
			'ready-animation',
		]) {
			expect(inventory.modifiers.some((entry) => entry.name === '--' + name)).toBe(false)
			expect(inventory.data.some((entry) => entry.name === 'data-' + name)).toBe(true)
		}
	})

	it('matches the current emission sites across core, setup, plugins and every adapter', () => {
		for (const kind of kinds) expect(names(contract[kind]), kind).toEqual(inventory[kind])
	})

	it('has unique names, English descriptions and explicit scopes', () => {
		for (const kind of kinds) {
			const entries = contract[kind]
			expect(new Set(entries.map((entry: { name: string }) => entry.name)).size).toBe(
				entries.length,
			)
			for (const entry of entries) {
				expect(entry.description.trim().length).toBeGreaterThan(15)
				expect(entry.scope.trim().length).toBeGreaterThan(0)
				expect(entry.description).not.toMatch(/[\u0400-\u04ff]/)
				if (kind === 'data') {
					expect(entry.values).toBeTruthy()
					expect(entry.presence).toBeTruthy()
				}
				if (kind === 'dynamic') expect(entry.pattern).toBeTruthy()
			}
		}
	})

	it('publishes both global markers and preserves the two-section variables schema', () => {
		expect(
			contract.data.some((entry: { name: string }) => entry.name === 'data-so-motion'),
		).toBe(true)
		expect(contract.globals[0].name).toBe('data-so-theme')
		const variables = JSON.parse(
			readFileSync(resolve(import.meta.dirname, '../theme-variables.json'), 'utf8'),
		)
		expect(Object.keys(variables)).toEqual(['base-reads', 'theme-reads'])
		for (const section of Object.values(variables))
			for (const description of Object.values(section as Record<string, unknown>)) {
				expect(typeof description).toBe('string')
				expect(description).not.toMatch(/[\u0400-\u04ff]/)
			}
	})

	it('detects removed entries, obsolete entries and new sites for an existing class', () => {
		const removed = structuredClone(inventory)
		removed.parts.pop()
		expect(drift(inventory, removed)).toEqual(['parts'])
		const obsolete = structuredClone(inventory)
		obsolete.data.push({ name: 'data-obsolete', sources: ['obsolete.ts'] })
		expect(drift(inventory, obsolete)).toEqual(['data'])
		const newSite = structuredClone(inventory)
		collectSource(
			'<span class="so-button__text" />',
			'packages/ui/svelte/src/new.svelte',
			newSite,
		)
		expect(drift(inventory, newSite)).toEqual(['parts'])
	})

	it('extracts static adapter classes and data attributes without selectors or comments', () => {
		for (const source of [
			'<span class="so-button__text" data-new="true"></span>',
			'<span className="so-button__text" data-new={true} />',
			'<span class="so-button__text" :data-new="value"></span>',
			'<span class="so-button__text" [attr.data-new]="value"></span>',
		]) {
			const found = fixture(source)
			expect(found.parts.map((entry) => entry.name)).toContain('so-button__text')
			expect(found.data.map((entry) => entry.name)).toContain('data-new')
		}
		expect(
			fixture("// 'so-comment__part'\n@Component({selector: '[so-no-class]'})").roots,
		).toEqual([])
	})

	it('detects computed modifiers, chained datasets and new direct class constructors', () => {
		const found = fixture(
			"this._classes.swap({prefix: '--new-'}); this.dataset.add('first', true).add('second', false); new TClasses('so-new')",
		)
		expect(found.modifiers.map((entry) => entry.name)).toContain('--new-')
		expect(found.data.map((entry) => entry.name)).toEqual(['data-second', 'data-first'])
		expect(found.roots.map((entry) => entry.name)).toEqual(['so-new'])
		expect(fixture('<span class="so-button--new" />').modifiers[0].name).toBe('so-button--new')
		const dynamic = fixture('this._classes.add(`--new-${value}`)')
		expect(dynamic.dynamic[0].name).toBe('`--new-${value}`')
		expect(drift({ ...dynamic, dynamic: [] }, dynamic)).toEqual(['dynamic'])
	})
})

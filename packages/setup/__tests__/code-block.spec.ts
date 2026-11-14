// @vitest-environment jsdom
import { afterEach, describe, it, expect, vi } from 'vitest'
import { TCodeBlock } from '@soxa-ui/core'
import { CodeBlockDescriptor } from '../content/descriptors'
import { createAdapterContext } from '../protected/adapter'

afterEach(() => vi.unstubAllGlobals())
describe('CodeBlock clipboard mounting', () => {
	it('reports an unavailable API as an error and never announces success', () => {
		vi.stubGlobal('navigator', {})
		const ctrl = new TCodeBlock({ code: 'exact\r\n' })
		const adapter = createAdapterContext(CodeBlockDescriptor(), { ctrl })
		const failed = vi.fn(),
			copied = vi.fn()
		ctrl.events.on('copy:error', failed)
		ctrl.events.on('copy', copied)
		ctrl.copy()
		expect(failed).toHaveBeenCalledWith({
			value: undefined,
			code: 'exact\r\n',
			error: expect.any(Error),
		})
		expect(copied).not.toHaveBeenCalled()
		expect(ctrl.copyState).toBe('error')
		adapter.destroy()
	})
	it('keeps the clicked source in events without showing stale feedback on a new snippet', async () => {
		let finish: (() => void) | undefined
		vi.stubGlobal('navigator', {
			clipboard: {
				writeText: () =>
					new Promise<void>((resolve) => {
						finish = resolve
					}),
			},
		})
		const ctrl = new TCodeBlock({
			snippets: [
				{ value: 'a', label: 'A', code: 'first' },
				{ value: 'b', label: 'B', code: 'second' },
			],
		})
		const adapter = createAdapterContext(CodeBlockDescriptor(), { ctrl })
		const copied = vi.fn()
		ctrl.events.on('copy', copied)
		ctrl.copy()
		expect(ctrl.copyState).toBe('pending')
		ctrl.value = 'b'
		finish?.()
		await Promise.resolve()
		expect(copied).toHaveBeenCalledWith({ value: 'a', code: 'first' })
		expect(ctrl.copyState).toBe('idle')
		adapter.destroy()
	})
	it('drops unfinished feedback on destroy and allows a later mounting to copy again', async () => {
		let finish: (() => void) | undefined
		vi.stubGlobal('navigator', {
			clipboard: {
				writeText: () =>
					new Promise<void>((resolve) => {
						finish = resolve
					}),
			},
		})
		const ctrl = new TCodeBlock({ code: 'source' })
		const adapter = createAdapterContext(CodeBlockDescriptor(), { ctrl })
		const copied = vi.fn()
		ctrl.events.on('copy', copied)
		ctrl.copy()
		adapter.destroy()
		expect(ctrl.copyState).toBe('idle')
		finish?.()
		await Promise.resolve()
		expect(copied).not.toHaveBeenCalled()
		const next = createAdapterContext(CodeBlockDescriptor(), { ctrl })
		ctrl.copy()
		expect(ctrl.copyState).toBe('pending')
		next.destroy()
	})
})

it('warns once for conflicting sources and ignores transient conflicts during mode changes', async () => {
	const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
	const ctrl = new TCodeBlock({
		code: 'single',
		snippets: [{ value: 'tab', label: 'Tab', code: 'tabbed' }],
	})
	const adapter = createAdapterContext(CodeBlockDescriptor(), { ctrl })
	try {
		await Promise.resolve()
		expect(warn).toHaveBeenCalledOnce()
		ctrl.snippets = undefined
		await Promise.resolve()
		ctrl.snippets = [{ value: 'tab', label: 'Tab', code: 'tabbed' }]
		ctrl.code = ''
		await Promise.resolve()
		expect(warn).toHaveBeenCalledOnce()
	} finally {
		adapter.destroy()
		warn.mockRestore()
	}
})

describe('CodeBlock outstanding clipboard requests', () => {
	it.each(['success', 'error'])(
		'guards the physical Promise across source changes and releases after %s',
		async (outcome) => {
			let resolve: (() => void) | undefined
			let reject: ((error: Error) => void) | undefined
			const writeText = vi
				.fn()
				.mockImplementationOnce(
					() =>
						new Promise<void>((done, fail) => {
							resolve = done
							reject = fail
						}),
				)
				.mockResolvedValue(undefined)
			vi.stubGlobal('navigator', { clipboard: { writeText } })
			const ctrl = new TCodeBlock({ code: 'first' })
			const adapter = createAdapterContext(CodeBlockDescriptor(), { ctrl })

			try {
				ctrl.copy()
				ctrl.copy()
				expect(ctrl.copyState).toBe('pending')
				ctrl.code = 'second'
				ctrl.copy()
				ctrl.snippets = [{ value: 'tab', label: 'Tab', code: 'third' }]
				ctrl.code = ''
				ctrl.copy()
				expect(writeText).toHaveBeenCalledTimes(1)

				if (outcome === 'success') resolve?.()
				else reject?.(new Error('denied'))
				await Promise.resolve()
				expect(ctrl.copyState).toBe('idle')
				ctrl.copy()
				expect(writeText).toHaveBeenCalledTimes(2)
				expect(writeText).toHaveBeenLastCalledWith('third')
				await Promise.resolve()
				expect(ctrl.copyState).toBe('success')
			} finally {
				adapter.destroy()
			}
		},
	)

	it.each(['success', 'error'])(
		'ignores late %s after destroy while a new mounting copies',
		async (outcome) => {
			let resolve: (() => void) | undefined
			let reject: ((error: Error) => void) | undefined
			const writeText = vi
				.fn()
				.mockImplementationOnce(
					() =>
						new Promise<void>((done, fail) => {
							resolve = done
							reject = fail
						}),
				)
				.mockResolvedValue(undefined)
			vi.stubGlobal('navigator', { clipboard: { writeText } })
			const ctrl = new TCodeBlock({ code: 'source' })
			const adapter = createAdapterContext(CodeBlockDescriptor(), { ctrl })
			const copied = vi.fn()
			const failed = vi.fn()
			ctrl.events.on('copy', copied)
			ctrl.events.on('copy:error', failed)
			ctrl.copy()
			adapter.destroy()
			const next = createAdapterContext(CodeBlockDescriptor(), { ctrl })

			try {
				ctrl.copy()
				await Promise.resolve()
				expect(ctrl.copyState).toBe('success')
				if (outcome === 'success') resolve?.()
				else reject?.(new Error('denied'))
				await Promise.resolve()
				expect(copied).toHaveBeenCalledTimes(1)
				expect(failed).not.toHaveBeenCalled()
				expect(ctrl.copyState).toBe('success')
			} finally {
				next.destroy()
			}
		},
	)
})

it.each(['code', 'copyable', 'value'])(
	'does not revive stale feedback after %s changes back',
	async (property) => {
		let finish: (() => void) | undefined
		const writeText = vi
			.fn()
			.mockImplementationOnce(
				() =>
					new Promise<void>((resolve) => {
						finish = resolve
					}),
			)
			.mockResolvedValue(undefined)
		vi.stubGlobal('navigator', { clipboard: { writeText } })
		const ctrl = new TCodeBlock(
			property === 'value'
				? {
						snippets: [
							{ value: 'a', label: 'A', code: 'first' },
							{ value: 'b', label: 'B', code: 'second' },
						],
					}
				: { code: 'first' },
		)
		const adapter = createAdapterContext(CodeBlockDescriptor(), { ctrl })

		try {
			ctrl.copy()
			if (property === 'code') {
				ctrl.code = 'second'
				ctrl.code = 'first'
			}
			if (property === 'copyable') {
				ctrl.copyable = false
				ctrl.copyable = true
			}
			if (property === 'value') {
				ctrl.value = 'b'
				ctrl.value = 'a'
			}
			ctrl.copy()
			expect(writeText).toHaveBeenCalledTimes(1)
			finish?.()
			await Promise.resolve()
			expect(ctrl.copyState).toBe('idle')
			expect(ctrl.copyButton.disabled).toBe(false)
			ctrl.copy()
			await Promise.resolve()
			expect(writeText).toHaveBeenCalledTimes(2)
			expect(ctrl.copyState).toBe('success')
		} finally {
			adapter.destroy()
		}
	},
)

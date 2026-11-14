import { afterEach, describe, expect, it, vi } from 'vitest'
import { waitForRegistry, workspaceVersions } from '../registry.ts'

const core = '@soxa-ui/core'
const versions = new Map([[core, '0.4.0']])
const ready = (name = core, version = '0.4.0') =>
	Response.json({
		'dist-tags': { latest: '0.3.0' },
		versions: {
			[version]: {
				name,
				version,
				dist: { tarball: 'https://registry.npmjs.org/package.tgz' },
			},
		},
	})

afterEach(() => vi.unstubAllGlobals())

describe('release versions', () => {
	it('keeps independent component, theme, icon and prerelease versions', () => {
		expect([
			...workspaceVersions(
				new Map([
					[core, { version: '0.5.0-beta.0' }],
					['@soxa-ui/theme-oren', { version: '0.4.1' }],
					['@soxa-ui/icons-material', { version: '0.3.1' }],
				]),
			),
		]).toEqual([
			[core, '0.5.0-beta.0'],
			['@soxa-ui/theme-oren', '0.4.1'],
			['@soxa-ui/icons-material', '0.3.1'],
		])
		expect(() => workspaceVersions(new Map([[core, {}]]))).toThrow('missing workspace version')
	})
})

describe('registry visibility', () => {
	it('accepts the expected version even while latest still points at the previous release', async () => {
		const request = vi.fn().mockResolvedValueOnce(ready())
		vi.stubGlobal('fetch', request)
		await waitForRegistry(versions)
		expect(request).toHaveBeenCalledWith(
			'https://registry.npmjs.org/%40soxa-ui%2Fcore',
			expect.objectContaining({
				cache: 'no-store',
				headers: expect.objectContaining({ 'cache-control': 'no-cache' }),
			}),
		)
	})

	it('waits for missing versions without requesting already visible packages again', async () => {
		const icons = '@soxa-ui/icons-material'
		const request = vi
			.fn()
			.mockResolvedValueOnce(Response.json({ versions: { '0.3.0': {} } }))
			.mockResolvedValueOnce(ready(icons, '0.3.1'))
			.mockResolvedValueOnce(ready())
		vi.stubGlobal('fetch', request)
		const report = vi.fn()
		await waitForRegistry(
			new Map([
				[core, '0.4.0'],
				[icons, '0.3.1'],
			]),
			{ intervalMs: 0, report },
		)
		expect(request).toHaveBeenCalledTimes(3)
		expect(report).toHaveBeenCalledWith(
			expect.stringContaining(core + '@0.4.0: not visible yet'),
		)
	})

	it.each([404, 408, 429, 503])('retries transient HTTP %s', async (status) => {
		const request = vi
			.fn()
			.mockResolvedValueOnce(new Response('', { status }))
			.mockResolvedValueOnce(ready())
		vi.stubGlobal('fetch', request)
		await waitForRegistry(versions, { intervalMs: 0, report: vi.fn() })
		expect(request).toHaveBeenCalledTimes(2)
	})

	it('retries a network error', async () => {
		const request = vi
			.fn()
			.mockRejectedValueOnce(new TypeError('connection reset'))
			.mockResolvedValueOnce(ready())
		vi.stubGlobal('fetch', request)
		await waitForRegistry(versions, { intervalMs: 0, report: vi.fn() })
		expect(request).toHaveBeenCalledTimes(2)
	})

	it('stops after the retry bound and names the unavailable version', async () => {
		const request = vi.fn().mockImplementation(async () => Response.json({ versions: {} }))
		vi.stubGlobal('fetch', request)
		await expect(
			waitForRegistry(versions, { attempts: 2, intervalMs: 0, report: vi.fn() }),
		).rejects.toThrow(core + '@0.4.0: not visible yet')
		expect(request).toHaveBeenCalledTimes(2)
	})

	it.each([401, 403])('fails immediately on HTTP %s', async (status) => {
		const request = vi.fn().mockResolvedValueOnce(new Response('', { status }))
		vi.stubGlobal('fetch', request)
		await expect(waitForRegistry(versions)).rejects.toThrow('npm HTTP ' + status)
		expect(request).toHaveBeenCalledTimes(1)
	})

	it.each([
		{},
		{ versions: [] },
		{ versions: { '0.4.0': { name: core, version: '0.3.0', dist: { tarball: 'https://x' } } } },
		{ versions: { '0.4.0': { name: core, version: '0.4.0' } } },
	])('fails immediately on invalid metadata', async (metadata) => {
		const request = vi.fn().mockResolvedValueOnce(Response.json(metadata))
		vi.stubGlobal('fetch', request)
		await expect(waitForRegistry(versions)).rejects.toThrow('invalid npm')
		expect(request).toHaveBeenCalledTimes(1)
	})
})

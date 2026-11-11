// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { TAvatar } from '@soxa-ui/core'
import { TPluginBundle, TElementPlugin, TAvatarImagePlugin } from '../src'

afterEach(() => vi.restoreAllMocks())

function fixture(cached?: number) {
	const root = document.createElement('span')
	const images: HTMLImageElement[] = []
	const create = document.createElement.bind(document)
	vi.spyOn(document, 'createElement').mockImplementation((tag, options) => {
		const node = create(tag, options)
		if (node instanceof HTMLImageElement) {
			Object.defineProperty(node, 'complete', { value: cached !== undefined })
			Object.defineProperty(node, 'naturalWidth', { value: cached ?? 0, configurable: true })
			images.push(node)
		}
		return node
	})
	const ctrl = new TAvatar({ src: 'a' })
	const bundle = new TPluginBundle(ctrl).use(TElementPlugin).use(TAvatarImagePlugin)
	const element = bundle.get(TElementPlugin)
	if (!element) throw new Error('Missing element plugin')
	const ready = () => element.events.emit('ready', root)
	const finish = (image: HTMLImageElement, width = 20) => {
		Object.defineProperty(image, 'naturalWidth', { value: width, configurable: true })
		image.dispatchEvent(new Event(width ? 'load' : 'error'))
	}
	return { ctrl, bundle, element, images, ready, finish }
}

describe('Avatar image lifecycle', () => {
	it.each([20, 0])('handles cached complete resources with width %s', (width) => {
		const f = fixture(width)
		expect(f.images).toHaveLength(0)
		expect(f.ctrl.status).toBe('idle')
		f.ready()
		expect(f.ctrl.status).toBe(width ? 'loaded' : 'error')
		f.bundle.destroy()
	})
	it('ignores stale completions after a new src, clearing src, removal and destroy', () => {
		const f = fixture()
		f.ready()
		expect(f.ctrl.status).toBe('loading')
		f.ctrl.src = 'b'
		f.finish(f.images[0])
		expect(f.ctrl.status).toBe('loading')
		f.finish(f.images[1], 0)
		expect(f.ctrl.status).toBe('error')
		f.ctrl.src = 'c'
		f.ctrl.src = ''
		f.finish(f.images[2])
		expect(f.ctrl.status).toBe('idle')
		f.ctrl.src = 'd'
		f.element.events.emit('removed')
		f.finish(f.images[3])
		expect(f.ctrl.status).toBe('idle')
		f.ready()
		expect(f.ctrl.status).toBe('loading')
		f.bundle.destroy()
		f.finish(f.images[4])
		expect(f.ctrl.status).toBe('idle')
		f.ctrl.src = 'e'
		expect(f.images).toHaveLength(5)
	})
	it.each(['loaded', 'error'] as const)(
		'preserves the next request started by a synchronous %s listener',
		(status) => {
			const f = fixture()
			f.ctrl.events.on('change:status', ({ newValue }) => {
				if (newValue === status) f.ctrl.src = 'b'
			})
			f.ready()
			f.finish(f.images[0], status === 'loaded' ? 20 : 0)
			expect(f.images).toHaveLength(2)
			expect(f.ctrl.status).toBe('loading')
			f.finish(f.images[1], 20)
			expect(f.ctrl.status).toBe('loaded')
			f.bundle.destroy()
		},
	)
	it('does not start an invalidated request after a synchronous loading listener', () => {
		const f = fixture()
		f.ctrl.events.on('change:status', ({ newValue }) => {
			if (newValue === 'loading') f.ctrl.src = ''
		})
		f.ready()
		expect(f.images[0].getAttribute('src')).toBeNull()
		f.finish(f.images[0])
		expect(f.ctrl.status).toBe('idle')
		f.bundle.destroy()
	})
})

it('stops an idle listener from reviving a destroyed mounting', () => {
	const f = fixture()
	f.ready()
	f.ctrl.events.on('change:status', ({ newValue }) => {
		if (newValue === 'idle') f.bundle.destroy()
	})
	f.ready()
	expect(f.images).toHaveLength(1)
	f.finish(f.images[0])
	expect(f.ctrl.status).toBe('idle')
})
it('loads again when the same external control is remounted', () => {
	const f = fixture()
	f.ready()
	f.bundle.destroy()
	const bundle = new TPluginBundle(f.ctrl).use(TElementPlugin).use(TAvatarImagePlugin)
	const element = bundle.get(TElementPlugin)
	if (!element) throw new Error('Missing element plugin')
	element.events.emit('ready', document.createElement('span'))
	f.finish(f.images[0])
	expect(f.ctrl.status).toBe('loading')
	f.finish(f.images[1])
	expect(f.ctrl.status).toBe('loaded')
	bundle.destroy()
})

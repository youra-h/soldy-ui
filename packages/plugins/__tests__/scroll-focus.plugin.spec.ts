// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { TTabs } from '@soxa-ui/core'
import { TElementPlugin, TPluginBundle, TScrollFocusPlugin } from '../src'

class TResize implements ResizeObserver {
	static instances: TResize[] = []
	readonly observe = vi.fn<(target: Element, options?: ResizeObserverOptions) => void>()
	readonly unobserve = vi.fn<(target: Element) => void>()
	readonly disconnect = vi.fn<() => void>()
	constructor(private readonly callback: ResizeObserverCallback) {
		TResize.instances.push(this)
	}
	trigger(): void {
		this.callback([], this)
	}
}

class TMutation implements MutationObserver {
	static instances: TMutation[] = []
	readonly observe = vi.fn<(target: Node, options?: MutationObserverInit) => void>()
	readonly disconnect = vi.fn<() => void>()
	readonly takeRecords = (): MutationRecord[] => []
	constructor(private readonly callback: MutationCallback) {
		TMutation.instances.push(this)
	}
	trigger(): void {
		this.callback([], this)
	}
}

const frames = new Map<number, FrameRequestCallback>()
let sequence = 0
const bundles: TPluginBundle[] = []
const flush = () => {
	const pending = [...frames.values()]
	frames.clear()
	for (const callback of pending) callback(0)
}

beforeEach(() => {
	TResize.instances = []
	TMutation.instances = []
	vi.stubGlobal('ResizeObserver', TResize)
	vi.stubGlobal('MutationObserver', TMutation)
	vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
		const id = ++sequence
		frames.set(id, callback)
		return id
	})
	vi.stubGlobal('cancelAnimationFrame', (id: number) => frames.delete(id))
})
afterEach(() => {
	for (const bundle of bundles) bundle.destroy()
	bundles.length = 0
	frames.clear()
	document.body.replaceChildren()
	vi.unstubAllGlobals()
})

function install() {
	const owner = new TTabs({ disabled: true })
	const bundle = new TPluginBundle(owner)
		.use(TElementPlugin)
		.use(TScrollFocusPlugin, { target: (_owner: unknown, root: Element) => root })
	bundles.push(bundle)
	const element = bundle.get(TElementPlugin)
	if (!element) throw new Error('Missing element plugin')
	return { owner, bundle, element }
}

function viewport() {
	const root = document.createElement('div')
	root.style.cssText = 'overflow-x:auto;overflow-y:hidden'
	const content = document.createElement('div')
	root.append(content)
	document.body.append(root)
	const size = { width: 100, height: 40, scrollWidth: 300, scrollHeight: 40 }
	Object.defineProperties(root, {
		clientWidth: { get: () => size.width },
		clientHeight: { get: () => size.height },
		scrollWidth: { get: () => size.scrollWidth },
		scrollHeight: { get: () => size.scrollHeight },
	})
	return { root, content, size }
}

describe('shared scroll focus observer lifecycle', () => {
	it('server installation does not create DOM observers or a Tab stop', () => {
		const { owner } = install()
		expect(owner.scrollAttrs.toObject()).toEqual({})
		expect(TResize.instances).toHaveLength(0)
		expect(TMutation.instances).toHaveLength(0)
		expect(frames.size).toBe(0)
	})

	it('coalesces observer notifications into one measure and keeps stable resize targets', () => {
		const { owner, element } = install()
		const { root, content, size } = viewport()
		element.events.emit('ready', root)
		const resize = TResize.instances[0]
		const mutation = TMutation.instances[0]
		if (!resize || !mutation) throw new Error('Missing observers')
		resize.trigger()
		mutation.trigger()
		expect(frames.size).toBe(1)
		flush()
		expect(owner.scrollAttrs.toObject()).toEqual({ tabindex: '0' })
		expect(resize.observe.mock.calls.map(([node]) => node)).toEqual([root, content])

		size.scrollWidth = size.width
		resize.trigger()
		mutation.trigger()
		flush()
		expect(owner.scrollAttrs.toObject()).toEqual({})
		expect(resize.observe).toHaveBeenCalledTimes(2)
		expect(mutation.observe.mock.calls[0]?.[1]).toMatchObject({
			subtree: true,
			childList: true,
			characterData: true,
			attributes: true,
		})
	})

	it('does not turn clipped content into a keyboard scroll target', () => {
		const { owner, element } = install()
		const { root } = viewport()
		root.style.overflowX = 'hidden'
		element.events.emit('ready', root)
		flush()
		expect(owner.scrollAttrs.toObject()).toEqual({})
	})

	it('adds new content resize targets and stops observing removed content', () => {
		const { element } = install()
		const { root, content } = viewport()
		element.events.emit('ready', root)
		flush()
		const resize = TResize.instances[0]
		const mutation = TMutation.instances[0]
		if (!resize || !mutation) throw new Error('Missing observers')
		const next = document.createElement('div')
		root.replaceChildren(next)
		mutation.trigger()
		flush()
		expect(resize.unobserve).toHaveBeenCalledWith(content)
		expect(resize.observe.mock.calls.map(([node]) => node)).toEqual([root, content, next])
	})

	it('root removal cancels queued work, disconnects and resets a surviving model', () => {
		const { owner, element } = install()
		const { root } = viewport()
		element.events.emit('ready', root)
		flush()
		expect(owner.scrollAttrs.toObject()).toEqual({ tabindex: '0' })
		const resize = TResize.instances[0]
		const mutation = TMutation.instances[0]
		if (!resize || !mutation) throw new Error('Missing observers')
		resize.trigger()
		element.events.emit('removed')
		expect(frames.size).toBe(0)
		expect(owner.scrollAttrs.toObject()).toEqual({})
		expect(resize.disconnect).toHaveBeenCalledOnce()
		expect(mutation.disconnect).toHaveBeenCalledOnce()
		mutation.trigger()
		expect(frames.size).toBe(0)
	})

	it('destroy cancels a pending measure and releases its model output', () => {
		const { owner, bundle, element } = install()
		const { root } = viewport()
		element.events.emit('ready', root)
		flush()
		TResize.instances[0]?.trigger()
		bundle.destroy()
		expect(frames.size).toBe(0)
		expect(owner.scrollAttrs.toObject()).toEqual({})
	})
})

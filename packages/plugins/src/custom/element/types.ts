import type { TPluginEvents } from '../../base/types'

export type TElementServiceEvents = TPluginEvents & {
	/**
	 * Internal synchronous root binding, including removal before ready.
	 * Native controls use it to guard activation before the first frame.
	 * Not exported by ElementPluginDescriptor; ready/removed keep their timing.
	 */
	bind: (element: Element | null) => void
	/**
	 * The root DOM element is available. Emitted once per binding, in the next
	 * requestAnimationFrame, only if the node is still bound. Changes before
	 * that frame produce one ready for the final node. Plugins use the node to
	 * attach DOM behavior; this does not wait for that behavior to finish.
	 * Exposed as element:ready by the element plugin namespace.
	 */
	ready: (element: Element) => void
	/**
	 * An announced root was removed or replaced. Emitted synchronously, only
	 * after ready: the events alternate, starting with ready. Replacement emits
	 * removed immediately and ready for the new node in the next animation frame.
	 * Exposed as element:removed; use it to detach DOM behavior.
	 */
	removed: () => void
}

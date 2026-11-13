import { afterEach, expect, it } from 'vitest'
import { waitForAuditState } from './axe/ready'

let panel: HTMLDivElement | undefined

afterEach(() => {
	for (const animation of panel?.getAnimations() ?? []) animation.cancel()
	panel?.remove()
	panel = undefined
})

it('waits for a late panel to finish fading before the audit, while loading loops continue', async () => {
	let notifyCheckingState = () => {}
	const checkingState = new Promise<void>((resolve) => {
		notifyCheckingState = resolve
	})
	let fade: Animation | undefined
	let loading: Animation | undefined
	const mounted = (async () => {
		await checkingState
		await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
		panel = document.createElement('div')
		panel.textContent = 'Late virtual options'
		document.body.append(panel)
		fade = panel.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200, fill: 'both' })
		loading = panel.animate([{ transform: 'rotate(0deg)' }, { transform: 'rotate(360deg)' }], {
			duration: 1000,
			iterations: Infinity,
		})
	})()

	await waitForAuditState(async () => {
		notifyCheckingState()
		await mounted
		expect(panel?.isConnected).toBe(true)
	})

	if (!panel) throw new Error('The delayed panel did not mount')
	expect(getComputedStyle(panel).opacity).toBe('1')
	expect(fade?.playState).toBe('finished')
	expect(loading?.playState).toBe('running')
})

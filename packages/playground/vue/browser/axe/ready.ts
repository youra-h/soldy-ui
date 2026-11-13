const frame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))

/** Finite transitions must finish; loading loops intentionally keep running. */
export async function settled() {
	let stable = 0
	const start = performance.now()
	while (stable < 2) {
		if (performance.now() - start > 10000) throw new Error('Finite animations did not settle')
		await frame()
		const active = document
			.getAnimations()
			.some(
				(animation) =>
					(animation.pending || animation.playState === 'running') &&
					Number.isFinite(animation.effect?.getComputedTiming().endTime),
			)
		stable = active ? 0 : stable + 1
	}
}

/** DOM readiness can reveal a late panel; wait for its transitions before measuring it. */
export async function waitForAuditState(confirmState: () => Promise<void>) {
	await confirmState()
	await settled()
	await confirmState()
}

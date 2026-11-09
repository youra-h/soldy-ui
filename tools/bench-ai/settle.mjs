/** Observe axe on stable finite-animation states; motion itself is sampled separately. */
export async function waitForVisualSettling(page, timeoutMs = 10000) {
	const start = Date.now()
	const handle = await page.waitForFunction(
		(state) => {
			const active = () =>
				document
					.getAnimations()
					.some(
						(animation) =>
							(animation.pending || animation.playState === 'running') &&
							Number.isFinite(animation.effect?.getComputedTiming().endTime),
					)
			if (active()) {
				state.stableFrames = 0
				return false
			}
			if (++state.stableFrames < 2) return false
			return {
				ignoredInfiniteAnimations: document
					.getAnimations()
					.filter(
						(animation) =>
							animation.playState === 'running' &&
							!Number.isFinite(animation.effect?.getComputedTiming().endTime),
					).length,
			}
		},
		{ stableFrames: 0 },
		{ timeout: timeoutMs, polling: 'raf' },
	)
	const details = await handle.jsonValue()
	await handle.dispose()
	return {
		status: 'settled-finite-animations',
		elapsedMs: Date.now() - start,
		timeoutMs,
		...details,
	}
}

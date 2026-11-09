/** Classifies observed keyframe properties without treating appearance as movement. */
export function motionSummary(observation) {
	const movement =
		/^(transform|translate|rotate|scale|offset|perspective|scroll|top$|left$|right$|bottom$|width$|height$|minWidth$|maxWidth$|minHeight$|maxHeight$|margin|padding|inset|gap|fontSize|lineHeight|letterSpacing|wordSpacing)/
	const appearance =
		/^(opacity|color|backgroundColor|border(?:Top|Right|Bottom|Left)?Color|outlineColor|textDecorationColor|boxShadow|textShadow|visibility|display)$/
	const animations = observation.animations.map((animation) => {
		const changed = animation.properties
		const moving = changed.filter((property) => movement.test(property))
		const visual = changed.filter((property) => appearance.test(property))
		const unknown = changed.filter(
			(property) => !moving.includes(property) && !visual.includes(property),
		)
		return { ...animation, moving, appearance: visual, unknown }
	})
	return {
		...observation,
		animations,
		status:
			!observation.media ||
			animations.some(
				(a) =>
					a.moving.length &&
					(a.activeDurationMs > 0 || a.activeDurationMs === 'infinite'),
			)
				? 'movement-observed'
				: animations.some((a) => !a.properties.length || a.unknown.length)
					? 'incomplete'
					: 'passed-observed-states',
		scope: 'Immediate active keyframes only; completed/untriggered animation and programmatic smooth scrolling are not covered',
	}
}

/** Runs in the page; preserves timings and only reports properties whose keyframe values vary. */
export function observeMotion() {
	return {
		media: matchMedia('(prefers-reduced-motion: reduce)').matches,
		animations: document
			.getAnimations()
			.filter((animation) => animation.pending || animation.playState === 'running')
			.map((animation) => {
				const frames = animation.effect?.getKeyframes() ?? []
				const names = [...new Set(frames.flatMap(Object.keys))].filter(
					(k) => !['offset', 'computedOffset', 'easing', 'composite'].includes(k),
				)
				return {
					properties: names.filter(
						(k) => new Set(frames.map((f) => JSON.stringify(f[k]))).size > 1,
					),
					activeDurationMs: Number.isFinite(
						animation.effect?.getComputedTiming().activeDuration,
					)
						? Number(animation.effect.getComputedTiming().activeDuration)
						: 'infinite',
					timing: animation.effect?.getTiming(),
					playState: animation.playState,
				}
			}),
	}
}

/** All findings remain available. Region is a host integration best practice for every participant. */
export function partitionAxe(result) {
	const wcag = result.violations.filter((v) => v.tags?.some((t) => /^wcag/.test(t)))
	const bestPractice = result.violations.filter((v) => !wcag.includes(v))
	return {
		...result,
		wcag,
		bestPractice,
		documentIntegration: bestPractice.filter(
			(v) =>
				v.id === 'region' &&
				v.nodes?.length &&
				v.nodes.every((n) => n.outsideLandmark === true),
		),
	}
}

export function parseFilters(args) {
	const filters = {}
	const allowed = {
		component: ['select', 'dialog', 'date-picker', 'tabs', 'table'],
		mode: ['default', 'rtl', 'narrow-touch', 'reduce', 'ime', 'large'],
		engine: ['chromium', 'webkit'],
	}
	for (const arg of args) {
		const match = /^--(component|mode|engine)=(.+)$/.exec(arg)
		if (!match || !allowed[match[1]].includes(match[2]))
			throw new Error(`Invalid harness filter: ${arg}`)
		if (filters[match[1]]) throw new Error(`Duplicate harness filter: ${match[1]}`)
		filters[match[1]] = match[2]
	}
	return filters
}

/** Runs in the document, preserving context for best-practice integration findings. */
export function annotateAxe(result) {
	for (const violation of result.violations)
		for (const node of violation.nodes) {
			try {
				const target =
					node.target.length === 1 && typeof node.target[0] === 'string'
						? document.querySelector(node.target[0])
						: null
				node.outsideLandmark = target
					? !target.closest(
							'main,nav,aside,header,footer,[role="main"],[role="navigation"],[role="complementary"],[role="banner"],[role="contentinfo"],[role="region"][aria-label],[role="region"][aria-labelledby]',
						)
					: null
			} catch {
				node.outsideLandmark = null
			}
		}
	return result
}

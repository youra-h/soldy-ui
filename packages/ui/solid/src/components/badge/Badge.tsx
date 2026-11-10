import type { JSX } from 'solid-js'
import { Root, createRootProps, createPartProps, renderSlot } from '../../adapter'
import { Show } from '../../adapter/runtime/flow'
import { setupBadge } from './setup.component'
import type { BadgeProps } from './base.component'

export function Badge(props: BadgeProps): JSX.Element {
	const binding = setupBadge(props)
	const state = binding.state
	const root = createRootProps(() => ({
		state,
		sets: [state.attrs, state.dataset],
		forward: binding.forwardProps(),
	}))
	const indicatorAria = createPartProps(() => state.aria)
	return (
		<Show when={state.rendered}>
			<Root tag={state.tag} attributes={root} ref={binding.ref}>
				<span class="so-badge__anchor">{renderSlot(props.anchor)}</span>
				<span class="so-badge__indicator" {...indicatorAria()}>
					{state.displayValue}
				</span>
			</Root>
		</Show>
	)
}

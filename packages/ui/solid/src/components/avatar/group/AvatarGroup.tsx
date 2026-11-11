import type { JSX } from 'solid-js'
import { Root, createRootProps, renderSlot, ResolvedSlot } from '../../../adapter'
import { Show } from '../../../adapter/runtime/flow'
import { setupAvatarGroup } from './setup.component'
import type { AvatarGroupProps } from './base.component'

export function AvatarGroup(props: AvatarGroupProps): JSX.Element {
	const binding = setupAvatarGroup(props)
	const state = binding.state
	const root = createRootProps(() => ({
		state,
		sets: [state.attrs, state.aria, state.dataset],
		forward: binding.forwardProps(),
	}))

	return (
		<Show when={state.rendered}>
			<Root tag={state.tag} attributes={root} ref={binding.ref}>
				{renderSlot(props.children)}
				<Show when={state.displayOverflow}>
					<span class="so-avatar-group__overflow">
						<ResolvedSlot
							content={props['overflow-content']}
							scope={() => ({ count: state.overflow ?? 0 })}
							fallback={
								<span class="so-avatar-group__count">{state.displayOverflow}</span>
							}
						/>
					</span>
				</Show>
			</Root>
		</Show>
	)
}

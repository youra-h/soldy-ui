import type { JSX } from 'solid-js'
import { Root, createRootProps, resolveSlot } from '../../adapter'
import { Show } from '../../adapter/runtime/flow'
import { setupAvatar } from './setup.component'
import type { AvatarProps } from './base.component'

export function Avatar(props: AvatarProps): JSX.Element {
	const binding = setupAvatar(props)
	const state = binding.state
	const root = createRootProps(() => ({
		state,
		sets: [state.attrs, state.aria, state.dataset],
		forward: binding.forwardProps(),
	}))
	const fallback = resolveSlot(
		() => props.fallback,
		() => ({}),
	)
	return (
		<Show when={state.rendered}>
			<Root tag={state.tag} attributes={root} ref={binding.ref}>
				<Show
					when={state.status === 'loaded'}
					fallback={
						<span class="so-avatar__fallback" aria-hidden="true">
							{fallback() ?? state.initials}
						</span>
					}
				>
					<img class="so-avatar__image" src={state.src || undefined} alt="" />
				</Show>
			</Root>
		</Show>
	)
}

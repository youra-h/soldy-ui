import type { JSX } from 'solid-js'
import { Root, createRootProps } from '../../adapter'
import { Show } from '../../adapter/runtime/flow'
import { setupSeparator } from './setup.component'
import type { SeparatorProps } from './base.component'

export function Separator(props: SeparatorProps): JSX.Element {
	const binding = setupSeparator(props)
	const state = binding.state
	const root = createRootProps(() => ({
		state,
		sets: [state.attrs, state.aria, state.dataset],
		forward: binding.forwardProps(),
	}))

	return (
		<Show when={state.rendered}>
			<Root tag={state.tag} attributes={root} ref={binding.ref} />
		</Show>
	)
}

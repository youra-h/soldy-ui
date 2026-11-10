import type { JSX } from 'solid-js'
import { Root, createRootProps, renderSlot, resolveSlot } from '../../adapter'
import { Show } from '../../adapter/runtime/flow'
import { setupToggleButton } from './setup.component'
import type { ToggleButtonProps } from './base.component'

export function ToggleButton(props: ToggleButtonProps): JSX.Element {
	return renderToggleButton(setupToggleButton(props), props)
}

export type TToggleButtonBinding = Pick<
	ReturnType<typeof setupToggleButton>,
	'ref' | 'forwardProps' | 'state'
>

export function renderToggleButton(
	binding: TToggleButtonBinding,
	props: ToggleButtonProps,
): JSX.Element {
	const state = binding.state
	const root = createRootProps(() => ({
		state,
		sets: [state.attrs, state.aria, state.dataset],
		forward: binding.forwardProps(),
	}))
	const content = resolveSlot(
		() => props.children,
		() => ({ text: state.text ?? '' }),
	)

	return (
		<Show when={state.rendered}>
			<Root tag={state.tag} attributes={root} ref={binding.ref}>
				{renderSlot(props.leading)}
				<span class="so-button__text">{content() ?? state.text}</span>
				{renderSlot(props.trailing)}
			</Root>
		</Show>
	)
}

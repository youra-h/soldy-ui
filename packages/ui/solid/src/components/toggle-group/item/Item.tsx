import type { JSX } from 'solid-js'
import { Root, createRootProps, renderSlot, resolveSlot } from '../../../adapter'
import { Show } from '../../../adapter/runtime/flow'
import { setupToggleGroupItem } from './setup.component'
import type { ToggleGroupItemProps } from './base.component'

export function ToggleGroupItem(props: ToggleGroupItemProps): JSX.Element {
	return renderToggleGroupItem(setupToggleGroupItem(props), props)
}

export type TToggleGroupItemBinding = Pick<
	ReturnType<typeof setupToggleGroupItem>,
	'ref' | 'forwardProps' | 'state'
>

export function renderToggleGroupItem(
	binding: TToggleGroupItemBinding,
	props: ToggleGroupItemProps,
): JSX.Element {
	const state = binding.state
	const root = createRootProps(() => ({
		state,
		sets: [
			state.tag === 'button' ? { type: 'button' } : undefined,
			state.attrs,
			state.aria,
			state.dataset,
		],
		forward: binding.forwardProps(),
	}))
	const content = resolveSlot(
		() => props.children,
		() => ({ text: state.text ?? '', selected: state.selected ?? false }),
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

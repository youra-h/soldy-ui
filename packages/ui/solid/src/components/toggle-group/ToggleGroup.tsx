import type { JSX } from 'solid-js'
import { Elevate, ResolvedSlot, Root, createRootProps, relaySlot, renderSlot } from '../../adapter'
import { For, Show } from '../../adapter/runtime/flow'
import { ToggleGroupItem } from './item'
import { setupToggleGroup } from './setup.component'
import type { ToggleGroupProps } from './base.component'

export function ToggleGroup(props: ToggleGroupProps): JSX.Element {
	const binding = setupToggleGroup(props)
	const state = binding.state
	const root = createRootProps(() => ({
		state,
		sets: [state.attrs, state.aria, state.dataset],
		forward: binding.forwardProps(),
	}))

	return (
		<Show when={state.rendered}>
			<Root tag={state.tag} attributes={root} ref={binding.ref}>
				<Elevate layer={binding.layer}>
					<ResolvedSlot
						content={props.children}
						fallback={
							<For each={state.shown}>
								{(item) => (
									<ToggleGroupItem
										leading={renderSlot(props['item-leading'], { item })}
										trailing={renderSlot(props['item-trailing'], { item })}
										ctrl={item}
									>
										{relaySlot(props.item, { item })}
									</ToggleGroupItem>
								)}
							</For>
						}
					/>
				</Elevate>
			</Root>
		</Show>
	)
}

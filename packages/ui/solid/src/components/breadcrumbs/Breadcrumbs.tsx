import type { JSX } from 'solid-js'
import { Root, Elevate, ResolvedSlot, createRootProps, relaySlot, renderSlot } from '../../adapter'
import { For, Show } from '../../adapter/runtime/flow'
import { BreadcrumbsItem } from './item'
import { setupBreadcrumbs } from './setup.component'
import type { BreadcrumbsProps } from './base.component'

export function Breadcrumbs(props: BreadcrumbsProps): JSX.Element {
	const binding = setupBreadcrumbs(props),
		state = binding.state

	const root = createRootProps(() => ({
		state,
		sets: [state.attrs, state.aria, state.dataset],
		forward: binding.forwardProps(),
	}))

	return (
		<Show when={state.rendered}>
			<Root tag={state.tag} attributes={root} ref={binding.ref}>
				<Elevate layer={binding.layer}>
					<ol class="so-breadcrumbs__list">
						<ResolvedSlot
							content={props.children}
							fallback={
								<For each={state.shown}>
									{(item) => (
										<BreadcrumbsItem
											ctrl={item}
											leading={renderSlot(props['item-leading'], { item })}
											trailing={renderSlot(props['item-trailing'], { item })}
										>
											{relaySlot(props.item, { item })}
										</BreadcrumbsItem>
									)}
								</For>
							}
						/>
					</ol>
				</Elevate>
			</Root>
		</Show>
	)
}

import type { JSX } from 'solid-js'
import {
	Root,
	clickAction,
	createRootProps,
	createPartProps,
	renderSlot,
	resolveSlot,
	roleIcon,
} from '../../adapter'
import { Show } from '../../adapter/runtime/flow'
import { Button } from '../button'
import { Icon } from '../icon'
import { setupAlert } from './setup.component'
import type { AlertProps } from './base.component'

const CLOSE = roleIcon('close')

export function Alert(props: AlertProps): JSX.Element {
	const binding = setupAlert(props)
	const state = binding.state
	const root = createRootProps(() => ({
		state,
		sets: [state.attrs, state.aria, state.dataset],
		forward: binding.forwardProps(),
	}))
	const closeAria = createPartProps(() => state.closeAria)
	const closeIcon = resolveSlot(
		() => props['close-icon'],
		() => ({}),
	)
	const close = clickAction(() => binding.ctrl.hide())

	return (
		<Show when={state.rendered}>
			<Root tag={state.tag} attributes={root} ref={binding.ref}>
				<span class="so-alert__icon" aria-hidden="true">
					{renderSlot(props.icon)}
				</span>
				<div class="so-alert__body">
					<div class="so-alert__title">{renderSlot(props.title)}</div>
					<div class="so-alert__content">{renderSlot(props.children)}</div>
				</div>
				<div class="so-alert__action">{renderSlot(props.action)}</div>
				<Show when={state.closable}>
					<Button
						embedded="alert.close"
						type="button"
						class="so-alert__close"
						ref={close}
						{...closeAria()}
					>
						<span aria-hidden="true">
							{closeIcon() ?? <Icon embedded="alert.close-icon" tag={CLOSE} />}
						</span>
					</Button>
				</Show>
			</Root>
		</Show>
	)
}

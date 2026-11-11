import type { ElementType, ReactElement } from 'react'
import { renderSlot, roleIcon, toAriaProps, toRootProps, useClickAction } from '../../adapter'
import { Button } from '../button'
import { Icon } from '../icon'
import { useSetupAlert } from './setup.component'
import type { AlertProps } from './base.component'

const CLOSE = roleIcon('close')

export function Alert(props: AlertProps): ReactElement | null {
	const { ctrl, ref, forwardProps, state } = useSetupAlert(props)
	const close = useClickAction(() => ctrl.hide())

	if (!state.rendered) return null

	const Tag = state.tag as ElementType

	return (
		<Tag {...toRootProps(ref, state, [state.attrs, state.aria, state.dataset], forwardProps)}>
			<span className="so-alert__icon" aria-hidden="true">
				{renderSlot(props.icon)}
			</span>
			<div className="so-alert__body">
				<div className="so-alert__title">{renderSlot(props.title)}</div>
				<div className="so-alert__content">{renderSlot(props.children)}</div>
			</div>
			<div className="so-alert__action">{renderSlot(props.action)}</div>
			{state.closable ? (
				<Button
					embedded="alert.close"
					type="button"
					className="so-alert__close"
					ref={close}
					{...toAriaProps(state.closeAria)}
				>
					<span aria-hidden="true">
						{renderSlot(props['close-icon']) ?? (
							<Icon embedded="alert.close-icon" tag={CLOSE} />
						)}
					</span>
				</Button>
			) : null}
		</Tag>
	)
}

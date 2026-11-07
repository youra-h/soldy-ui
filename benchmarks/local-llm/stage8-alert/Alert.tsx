import type { ReactElement } from 'react'
import type { AlertProps } from './base.component'
import { useSetupAlert } from './setup.component'
import { useComponent, toRootProps, roleIcon, toAriaProps, renderSlot, Button, useClickAction } from './api'

export function Alert(props: AlertProps): ReactElement | null {
  const { ctrl, state, ref, forwardProps, layer } = useSetupAlert(props)
  if (!state.rendered) return null
  const closeAria = state.closeAria ?? {}
  const closeIconSlot = renderSlot(props['close-icon'])
  const iconSlot = renderSlot(props.icon, { type: state.type ?? '' })
  const textSlot = renderSlot(props.children, { text: state.text ?? '' })
  const contentSlot = renderSlot(props.content, { description: state.description ?? '' })
  const actionsSlot = renderSlot(props.actions)
  const closeRole = state.type ?? 'notification'
  const close = state.closable ? (
    <Button
      className="so-alert__close"
      embedded="alert.close"
      type="button"
      {...toAriaProps(closeAria)}
      ref={useClickAction(ctrl.hide)}
    >
      {closeIconSlot ?? roleIcon(closeRole)}
    </Button>
  ) : null
  return (
    <AlertDescriptor.Root
      {...toRootProps(ref, state, [state.attrs, state.aria, state.dataset], forwardProps)}
    >
      {iconSlot && <span className="so-alert__icon" aria-hidden="true">{iconSlot}</span>}
      {textSlot && <span className="so-alert__text">{textSlot}</span>}
      {contentSlot && <span className="so-alert__content">{contentSlot}</span>}
      {actionsSlot && <div className="so-alert__actions">{actionsSlot}</div>}
      {close}
    </AlertDescriptor.Root>
  )
}
import type { ReactElement } from 'react'
import type { AlertProps } from './base.component'
import { useComponent, toRootProps, renderSlot, roleIcon, toAriaProps, useClickAction } from './api'
import { Button, Icon } from '@soldy-ui/react'
import { AlertDescriptor } from './api'

export function Alert(props: AlertProps): ReactElement | null {
  const binding = useSetupAlert(props)
  const { ctrl, state, ref, forwardProps, layer } = binding
  
  if (!state.rendered) return null
  
  const closeAria = state.closeAria ?? {}
  const closeIcon = renderSlot(props['close-icon'] ?? undefined)
  
  const close = state.closable ? (
    <Button
      className="so-alert__close"
      embedded="alert.close"
      type="button"
      {...toAriaProps(closeAria)}
      ref={useClickAction(ctrl.hide)}
    >
      {closeIcon ?? <Icon tag={roleIcon('close')} embedded="alert.close-icon" />}
    </Button>
  ) : undefined
  
  const icon = renderSlot(props.icon ?? undefined) ?? <Icon tag={roleIcon(state.type ?? 'notification')} embedded="alert.icon" />
  const text = renderSlot(props.children ?? undefined) ?? <span>{state.text ?? ''}</span>
  const content = renderSlot(props.content ?? undefined) ?? <span>{state.description ?? ''}</span>
  
  const actions = renderSlot(props.actions ?? undefined)
  
  return (
    <div
      {...toRootProps(ref, state, [state.attrs, state.aria, state.dataset], forwardProps)}
      className="so-alert"
    >
      <div className="so-alert__icon" aria-hidden="true">{icon}</div>
      <div className="so-alert__text">{text}</div>
      <div className="so-alert__content">{content}</div>
      <div className="so-alert__actions">{actions}</div>
      {close}
    </div>
  )
}
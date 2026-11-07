import type { ElementType, ReactElement } from 'react'
import type { AlertProps } from './base.component'
import { Button, Icon, renderSlot, roleIcon, toAriaProps, toRootProps, useClickAction } from './api'
import { useSetupAlert } from './setup.component'

export function Alert(props: AlertProps): ReactElement | null {
  const { ctrl, state, ref, forwardProps } = useSetupAlert(props)
  const closeRef = useClickAction(() => { ctrl.hide() })

  if (!state.rendered) return null

  const Tag = state.tag as ElementType

  return (
    <Tag {...toRootProps(ref, state, [state.attrs, state.aria, state.dataset], forwardProps)}>
      <span className="so-alert__icon" aria-hidden="true">
        {renderSlot(props.icon, { type: state.type }) ?? (
          <Icon tag={roleIcon(state.type ?? 'notification')} embedded="alert.icon" />
        )}
      </span>
      <div className="so-alert__text">
        {renderSlot(props.children, { text: state.text ?? '' }) ?? state.text}
      </div>
      <div className="so-alert__content">
        {renderSlot(props.content, { description: state.description ?? '' }) ?? state.description}
      </div>
      <div className="so-alert__actions">{renderSlot(props.actions)}</div>
      {state.closable && (
        <Button
          {...toAriaProps(state.closeAria)}
          className="so-alert__close"
          embedded="alert.close"
          type="button"
          ref={closeRef}
        >
          {renderSlot(props['close-icon']) ?? (
            <Icon tag={roleIcon('close')} embedded="alert.close-icon" />
          )}
        </Button>
      )}
    </Tag>
  )
}

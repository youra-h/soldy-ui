import { AlertDescriptor } from '@soxa-ui/setup'
import type { IAlert } from '@soxa-ui/core'
import { ElementBase, defineElement } from '../../adapter'
import type { TElementClassOf, TElementType } from '../../adapter'
import { alertTemplate } from './alert.template'
import { setupAlert } from './setup.component'

export const TAlertElement: TElementClassOf<typeof HTMLDivElement, typeof AlertDescriptor, IAlert> =
	ElementBase(HTMLDivElement, {
		descriptor: AlertDescriptor,
		template: alertTemplate,
		setup: setupAlert,
	})

defineElement('so-alert', TAlertElement, 'div')

export type TAlertElementProps = TElementType<typeof TAlertElement>

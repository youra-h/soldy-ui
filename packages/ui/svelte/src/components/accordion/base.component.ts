import type { IAccordion } from '@soxa-ui/core'
import type { AccordionCollectionDescriptor, AccordionDescriptor } from '@soxa-ui/setup'
import type { EventProps, UseDomProps } from '../../types'

export type AccordionEventProps = EventProps<typeof AccordionDescriptor> &
	EventProps<typeof AccordionCollectionDescriptor>

export type AccordionProps = UseDomProps<
	typeof AccordionDescriptor,
	IAccordion,
	AccordionEventProps
>

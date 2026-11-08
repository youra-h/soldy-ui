import type { IAccordion } from '@soxa-ui/core'
import type { AccordionCollectionDescriptor, AccordionDescriptor } from '@soxa-ui/setup'
import type { EventProps, UseDomProps } from '../../types'

/** События Accordion — свои и фасада коллекции. */
export type AccordionEventProps = EventProps<typeof AccordionDescriptor> &
	EventProps<typeof AccordionCollectionDescriptor>

/** Пропсы Accordion; входы коллекции (`engine`, `items`, `mode`, `trackBy`) — в ядре. */
export type AccordionProps = UseDomProps<
	typeof AccordionDescriptor,
	IAccordion,
	AccordionEventProps
>

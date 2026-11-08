import { useEmits, useProps } from '../../../adapter'
import type { TEmits, TProps, UseProps } from '../../../types/common'
import { AccordionItemDescriptor, AccordionCollectionItemDescriptor } from '@soxa-ui/setup'
import type { IAccordionItem } from '@soxa-ui/core'

export const emitsAccordionItem: TEmits = [
	...useEmits(AccordionItemDescriptor()),
	...useEmits(AccordionCollectionItemDescriptor()),
]

export const propsAccordionItem: TProps = {
	...(useProps(AccordionItemDescriptor()) as TProps),
	...(useProps(AccordionCollectionItemDescriptor()) as TProps),
}

export type AccordionItemProps = UseProps<typeof AccordionItemDescriptor, IAccordionItem>

export default {
	name: 'BaseAccordionItem',
	emits: emitsAccordionItem,
	props: propsAccordionItem,
}

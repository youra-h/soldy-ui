/**
 * Internal collection rows use Button markup with ItemRow assembly.
 * div is used by ListBox, Tags and Menu; span by Select; a preserves native
 * navigation for hidden Breadcrumbs locations. Each native tag is registered
 * where its markup is first needed, with no button registration.
 * The mounting owns the row instance; its collection supplies ARIA and the
 * roving tab stop. See docs/architecture.md, Layer 8d.
 */

import { ItemRowDescriptor } from '@soxa-ui/setup'
import type { IButton } from '@soxa-ui/core'
import { ElementBase, defineElement } from '../../adapter'
import type { TElementClassOf, TElementOf } from '../../adapter'
import { buttonTemplate } from '../button/button.template'
import { setupItemRow } from './setup.component'

/** Одно описание на все теги строки. */
const ITEM_ROW = {
	descriptor: ItemRowDescriptor,
	template: buttonTemplate,
	setup: setupItemRow,
}

/** Row tags: div for collections, span for Select, and a for native breadcrumb links. */
export type TItemRowTag = 'div' | 'span' | 'a'

export type TItemRowTagClass<K extends TItemRowTag> = TElementClassOf<
	new () => HTMLElementTagNameMap[K],
	typeof ItemRowDescriptor,
	IButton
>

function variant<K extends TItemRowTag>(
	Native: new () => HTMLElementTagNameMap[K],
): TItemRowTagClass<K> {
	return ElementBase(Native, ITEM_ROW)
}

/** Класс тега создаётся и регистрируется при первом обращении; чужой нативный класс не компилируется. */
function registration<K extends TItemRowTag>(
	tag: K,
	Native: new () => HTMLElementTagNameMap[K],
): () => TItemRowTagClass<K> {
	let element: TItemRowTagClass<K> | undefined

	return () => {
		if (!element) {
			element = variant(Native)
			defineElement(`so-item-row-${tag}`, element, tag)
		}

		return element
	}
}

const REGISTRATIONS: { readonly [K in TItemRowTag]: () => TItemRowTagClass<K> } = {
	div: registration('div', HTMLDivElement),
	span: registration('span', HTMLSpanElement),
	a: registration('a', HTMLAnchorElement),
}

/** Register the native row tag where its markup is first used. */
export function registerItemRowTag<K extends TItemRowTag>(tag: K): TItemRowTagClass<K> {
	return REGISTRATIONS[tag]()
}

/** Row tags have no native disabled property; it remains a component prop. */
export type TItemRowElementProps<TNative extends HTMLElement> = TElementOf<
	TNative,
	typeof ItemRowDescriptor,
	IButton
>

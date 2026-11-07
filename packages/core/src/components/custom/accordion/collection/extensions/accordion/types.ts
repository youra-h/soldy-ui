import type { IAccordion } from "../../../types";
import type { TAccordionView } from "../../../types";
import type {
  IExtension,
  IExtensionItems,
} from "../../../../../base/collection";
import type { IAccordionItemExtension } from "./item";
import type { IAccordionItem } from "../../../item/types";
import type { TValuePayload } from "../../../../../../common";

/**
 * Контракт расширения accordion.
 * Используется как тип TParent в TAccordionItemExtension для типизированного доступа к _parent.
 */
export interface IAccordionExtension<
  TItem extends IAccordionItem = IAccordionItem,
>
  extends
    IExtension<TItem, TAccordionExtensionEvents>,
    IExtensionItems<TItem, IAccordionItemExtension<TItem>> {
  /** Внешний вид с инстанса TAccordion. */
  readonly view: TAccordionView | undefined;
}

/** Опции движка Accordion: владелец приходит и уходит после сборки. */
export type TAccordionEngineOptions<TOwner extends IAccordion = IAccordion> = {
  owner: TOwner;
};

/**
 * События расширения TAccordionExtension.
 */
export type TAccordionExtensionEvents = {
  "change:view": (payload: TValuePayload<TAccordionView | undefined>) => void;
};

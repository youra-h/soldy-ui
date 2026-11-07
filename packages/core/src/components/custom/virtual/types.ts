import type { TValuePayload } from "../../../common";
import type {
  IComponent,
  IComponentProps,
  TComponentEvents,
} from "../../base/component";

export interface IVirtualProps extends IComponentProps {
  /**
   * Окно включено: коллекции внутри обёртки рисуют только видимые элементы, а
   * на месте остальных — распорки той же высоты. Выключено — рисуют все
   */
  enabled?: boolean;
}

export type TVirtualEvents = TComponentEvents & {
  "change:enabled": (payload: TValuePayload<boolean>) => void;
};

export interface IVirtual extends IComponent<IVirtualProps, TVirtualEvents> {
  /** Окно включено: коллекции внутри обёртки рисуют только видимые элементы */
  enabled: boolean;
}

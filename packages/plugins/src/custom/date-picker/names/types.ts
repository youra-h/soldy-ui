import type { TValuePayload } from "@soldy-ui/core";
import type { TPluginEvents } from "../../../base";

export type TDatePickerNamesPluginEvents = TPluginEvents & {
  /** change:start — имя поля начала диапазона сменилось вместе с локалью */
  "change:start": (payload: TValuePayload<string>) => void;
  /** change:end — имя поля конца диапазона сменилось вместе с локалью */
  "change:end": (payload: TValuePayload<string>) => void;
  /** change:confirm — текст кнопки «OK» сменился вместе с локалью */
  "change:confirm": (payload: TValuePayload<string>) => void;
  /** change:cancel — текст кнопки «Отмена» сменился вместе с локалью */
  "change:cancel": (payload: TValuePayload<string>) => void;
};

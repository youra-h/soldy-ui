import type { TValuePayload } from "@soldy-ui/core";
import type { TPluginEvents } from "../../../base";

export type TTableNamesPluginEvents = TPluginEvents & {
  /** change:selectAll — имя чекбокса «выбрать все» сменилось вместе с локалью */
  "change:selectAll": (payload: TValuePayload<string>) => void;
};

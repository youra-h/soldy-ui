import type { TValuePayload } from "@soldy-ui/core";
import type { TPluginEvents } from "../../base";

export type TIdPluginEvents = TPluginEvents & {
  /** change:id — `id` узла сменился; `undefined` — снят */
  "change:id": (payload: TValuePayload<string | undefined>) => void;
};

import type { TPluginEvents } from "../../../base";
import type { TValuePayload } from "@soldy-ui/core";

export type TToastsLayoutPluginEvents = TPluginEvents & {
  "change:styles": (
    payload: TValuePayload<Record<string, string | number>>,
  ) => void;
};

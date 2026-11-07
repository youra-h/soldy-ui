import type { TPluginEvents } from "../../base";
import type { TValuePayload } from "@soldy-ui/core";

export type TSkeletonLayoutPluginEvents = TPluginEvents & {
  "change:styles": (
    payload: TValuePayload<Record<string, string | number>>,
  ) => void;
};

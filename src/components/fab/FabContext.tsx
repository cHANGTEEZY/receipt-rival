import { createContext, useContext } from "react";

import type { FabPosition } from "./types";

export type FabContextValue = {
  open: boolean;
  position: FabPosition;
  itemCount: number;
  /** Called by a `Fab.Item` after its own `onPress`, to collapse the menu. */
  closeMenu: () => void;
};

export const FabContext = createContext<FabContextValue | null>(null);

/** Only used internally by `Fab.Item` — throws outside of a `Fab` in menu mode. */
export function useFabContext(): FabContextValue {
  const context = useContext(FabContext);
  if (!context) {
    throw new Error("Fab.Item must be rendered inside a <Fab> with children.");
  }
  return context;
}

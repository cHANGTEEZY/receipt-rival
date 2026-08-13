import { createContext, useContext } from "react";

type SwipeMenuContextValue = {
  closeMenu: () => void;
  isMenuOpen: boolean;
  openMenu: () => void;
};

export const SwipeMenuContext = createContext<SwipeMenuContextValue | null>(
  null,
);

export function useSwipeMenuContext() {
  const context = useContext(SwipeMenuContext);

  if (!context) {
    throw new Error("useSwipeMenuContext must be used within SwipeMenuShell");
  }

  return context;
}

export function useOptionalSwipeMenuContext() {
  return useContext(SwipeMenuContext);
}

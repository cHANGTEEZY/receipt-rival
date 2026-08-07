import { useCallback, useEffect, useRef } from "react";
import { InteractionManager } from "react-native";

/** Default HeroUI PressableFeedback.Ripple `progress.baseDuration`. */
export const DEFAULT_RIPPLE_SETTLE_MS = 200;

type UseAfterRipplePressOptions = {
  delayMs?: number;
  enabled?: boolean;
  afterInteractions?: boolean;
};

/**
 * Defers a press action until after a press ripple has had time to finish.
 */
export function useAfterRipplePress(
  action: () => void,
  {
    delayMs = DEFAULT_RIPPLE_SETTLE_MS,
    enabled = true,
    afterInteractions = true,
  }: UseAfterRipplePressOptions = {},
) {
  const actionRef = useRef(action);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const interactionRef = useRef<{ cancel: () => void } | null>(null);

  useEffect(() => {
    actionRef.current = action;
  }, [action]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      interactionRef.current?.cancel();
    };
  }, []);

  const onPress = useCallback(() => {
    if (!enabled) return;

    if (timerRef.current) clearTimeout(timerRef.current);
    interactionRef.current?.cancel();
    interactionRef.current = null;

    const run = () => {
      actionRef.current();
    };

    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      if (!afterInteractions) {
        run();
        return;
      }
      interactionRef.current = InteractionManager.runAfterInteractions(run);
    }, delayMs);
  }, [afterInteractions, delayMs, enabled]);

  return {
    onPress,
    rippleSettleMs: delayMs,
  };
}

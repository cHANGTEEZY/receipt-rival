import {
  Skeleton as HeroSkeleton,
  type SkeletonProps,
} from "heroui-native";

/**
 * Shared shimmer config for every loader in the app.
 * One motion language everywhere — quiet, fast, reduced-motion aware.
 */
export const SKELETON_ANIMATION: NonNullable<SkeletonProps["animation"]> = {
  shimmer: { duration: 1400, speed: 1.1 },
};

/** HeroUI Skeleton with the app's shared shimmer config pre-applied. */
export function Skeleton({
  className,
  style,
  animation = SKELETON_ANIMATION,
  ...rest
}: SkeletonProps) {
  return (
    <HeroSkeleton
      variant="shimmer"
      animation={animation}
      className={className}
      style={style}
      {...rest}
    />
  );
}

/** Rounded rectangle with a width token (e.g. `w-24`, `w-full`). */
export function SkeletonText({
  width,
  className,
}: {
  width: string;
  className?: string;
}) {
  return (
    <HeroSkeleton
      variant="shimmer"
      animation={SKELETON_ANIMATION}
      className={`h-3.5 rounded-full ${width} ${className ?? ""}`}
    />
  );
}

/** Perfect circle — icons, checkboxes, rings, avatars. */
export function SkeletonCircle({ className }: { className?: string }) {
  return (
    <HeroSkeleton
      variant="shimmer"
      animation={SKELETON_ANIMATION}
      className={`rounded-full ${className ?? ""}`}
    />
  );
}

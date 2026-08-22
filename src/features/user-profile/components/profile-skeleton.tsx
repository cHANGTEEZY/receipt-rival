import { View } from "react-native";

const CARD = { borderCurve: "continuous" as const };

export function ProfileSkeleton() {
  return (
    <View className="gap-6">
      <View className="items-center gap-3 pt-2">
        <View
          className="size-28 rounded-full bg-surface"
          style={CARD}
        />
        <View className="h-7 w-40 rounded-2xl bg-surface" style={CARD} />
        <View className="h-4 w-52 rounded-2xl bg-surface" style={CARD} />
      </View>

      <View className="h-[76px] rounded-3xl bg-surface" style={CARD} />

      <View className="flex-row gap-2">
        <View className="h-[72px] flex-1 rounded-3xl bg-surface" style={CARD} />
        <View className="h-[72px] flex-1 rounded-3xl bg-surface" style={CARD} />
        <View className="h-[72px] flex-1 rounded-3xl bg-surface" style={CARD} />
      </View>

      {[0, 1].map((i) => (
        <View key={i} className="h-[64px] rounded-3xl bg-surface" style={CARD} />
      ))}
    </View>
  );
}

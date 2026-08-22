import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { router } from "expo-router";
import { Pressable, View } from "react-native";
import { useCSSVariable } from "uniwind";

import type { DeadbeatMeSummary } from "@/api/deadbeat";
import { hapticSelection } from "@/lib/haptics";
import { formatMoney } from "@/utils/money";

import { Typography } from "heroui-native/text";

import type { CurrencyTotal } from "../lib/balances";

type HomeBalanceHeroProps = {
  youOwe: CurrencyTotal;
  owedToYou: CurrencyTotal;
  shame?: DeadbeatMeSummary | null;
  fame?: DeadbeatMeSummary | null;
};

type BalanceColumnProps = {
  label: string;
  total: CurrencyTotal;
  amountClassName: string;
};

function BalanceColumn({ label, total, amountClassName }: BalanceColumnProps) {
  const isZero = total.amountCents === 0;

  return (
    <View className="min-w-0 flex-1 gap-1">
      <Typography type="body-xs" color="muted">
        {label}
      </Typography>
      <Typography
        type="h3"
        weight="bold"
        className={isZero ? undefined : amountClassName}
        numberOfLines={1}
      >
        {formatMoney(total.amountCents, total.currency)}
      </Typography>
    </View>
  );
}

function NetPositionLine({
  youOwe,
  owedToYou,
}: Pick<HomeBalanceHeroProps, "youOwe" | "owedToYou">) {
  const net = owedToYou.amountCents - youOwe.amountCents;
  if (youOwe.amountCents === 0 && owedToYou.amountCents === 0) return null;

  const isUp = net >= 0;
  const label = isUp ? "You're up" : "You're down";

  return (
    <View className="flex-row items-center gap-1.5">
      <View
        className={`h-1.5 w-1.5 rounded-full ${isUp ? "bg-success" : "bg-danger"}`}
      />
      <Typography type="body-xs" color="muted">
        {label}{" "}
        <Typography
          type="body-xs"
          weight="bold"
          className={isUp ? "text-success" : "text-danger"}
        >
          {formatMoney(Math.abs(net), youOwe.currency)}
        </Typography>{" "}
        across everyone
      </Typography>
    </View>
  );
}

function RankChip({
  summary,
  variant,
}: {
  summary: NonNullable<HomeBalanceHeroProps["shame"]>;
  variant: "shame" | "fame";
}) {
  const muted = useCSSVariable("--color-muted");
  const mutedColor = typeof muted === "string" ? muted : "#8a8a8f";
  const score =
    variant === "fame" ? summary.fameScore : summary.shameScore;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Your ${variant} rank ${summary.rank}, ${summary.title}`}
      onPress={() => {
        hapticSelection();
        router.push("/(app)/ranks");
      }}
    >
      <View
        className="flex-row items-center gap-3 rounded-full bg-surface px-4 py-3"
        style={{ borderCurve: "continuous" }}
      >
        <View className="min-w-0 flex-1">
          <Typography type="body-sm" weight="semibold" numberOfLines={1}>
            Your {variant}: {summary.title}
          </Typography>
          <Typography type="body-xs" color="muted">
            #{summary.rank} · {score}/100
          </Typography>
        </View>
        <HugeiconsIcon
          icon={ArrowRight01Icon}
          size={18}
          color={mutedColor}
          strokeWidth={1.75}
        />
      </View>
    </Pressable>
  );
}

export function HomeBalanceHero({
  youOwe,
  owedToYou,
  shame,
  fame,
}: HomeBalanceHeroProps) {
  return (
    <View className="gap-3">
      <View
        className="gap-5 rounded-4xl bg-surface px-5 py-6"
        style={{ borderCurve: "continuous" }}
      >
        <Typography type="body-sm" color="muted">
          Who’s late, who’s loaded.
        </Typography>

        <View className="flex-row items-stretch">
          <BalanceColumn
            label="You owe"
            total={youOwe}
            amountClassName="text-danger"
          />
          <View className="mx-4 w-px bg-border" />
          <BalanceColumn
            label="Owed to you"
            total={owedToYou}
            amountClassName="text-success"
          />
        </View>

        <NetPositionLine youOwe={youOwe} owedToYou={owedToYou} />
      </View>

      {shame ? <RankChip summary={shame} variant="shame" /> : null}
      {!shame && fame ? <RankChip summary={fame} variant="fame" /> : null}
    </View>
  );
}

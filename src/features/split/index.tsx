import { useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { View } from "react-native";

import { invalidatePaymentQueries } from "@/api/hooks/use-payments";
import GoBackButton from "@/components/GoBackButton";
import CollapsedLargeHeader from "@/components/layouts/CollapsedLargeHeader";

import SplitForm from "./components/SplitForm";
import type { SplitFormSchema } from "./data/split-form";
import { createSplit } from "./lib/create-split";

export default function SplitPage() {
  const queryClient = useQueryClient();

  const handleSubmit = async (values: SplitFormSchema) => {
    const result = await createSplit(values);
    invalidatePaymentQueries(queryClient, result.paymentId);
    router.replace(`/(screens)/split/${result.paymentId}`);
  };

  return (
    <View className="flex-1 bg-background">
      <CollapsedLargeHeader title="Split the Damage" leading={<GoBackButton />}>
        <View className="px-4 pb-8 pt-2">
          <SplitForm onSubmit={handleSubmit} />
        </View>
      </CollapsedLargeHeader>
    </View>
  );
}

import { router } from "expo-router";
import { View } from "react-native";

import GoBackButton from "@/components/GoBackButton";
import CollapsedLargeHeader from "@/components/layouts/CollapsedLargeHeader";
import { logger } from "@/utils/logger";

import SplitForm from "./components/SplitForm";
import type { SplitFormSchema } from "./data/split-form";

export default function SplitPage() {
  const handleSubmit = async (values: SplitFormSchema) => {
    logger.info("create split", values);
    router.back();
  };

  return (
    <View className="flex-1 bg-background">
      <CollapsedLargeHeader title="Create Split" leading={<GoBackButton />}>
        <View className="px-4 pb-8 pt-2">
          <SplitForm onSubmit={handleSubmit} />
        </View>
      </CollapsedLargeHeader>
    </View>
  );
}

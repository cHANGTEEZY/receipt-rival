import { router } from "expo-router";

import { hapticSelection } from "@/lib/haptics";
import {
  AddInvoiceIcon,
  QrCode01Icon,
  UserAdd01Icon,
} from "@hugeicons/core-free-icons";
import { useCSSVariable } from "uniwind";
import { Fab } from "./fab";

const SplitFab = () => {
  const color = useCSSVariable("--color-surface");
  const fabItemColor = typeof color === "string" ? color : "#F472B6";

  return (
    <Fab position="bottom-right">
      <Fab.Item
        icon={QrCode01Icon}
        label="Scan"
        onPress={() => {
          hapticSelection();
        }}
        color={fabItemColor}
      />
      <Fab.Item
        icon={UserAdd01Icon}
        label="Add Friend"
        onPress={() => {
          hapticSelection();
          router.push("/(screens)/add-or-find-friends");
        }}
        color={fabItemColor}
      />
      <Fab.Item
        icon={AddInvoiceIcon}
        label="Create Split"
        onPress={() => {
          hapticSelection();
          router.push("/(screens)/split");
        }}
        color={fabItemColor}
      />
    </Fab>
  );
};

export default SplitFab;

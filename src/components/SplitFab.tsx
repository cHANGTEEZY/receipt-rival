import { hapticSelection } from "@/lib/haptics";
import {
  AddInvoiceIcon,
  QrCode01Icon,
  UserAdd01Icon,
} from "@hugeicons/core-free-icons";
import { Fab } from "./fab";

const SplitFab = () => {
  return (
    <Fab position="bottom-right">
      <Fab.Item
        icon={QrCode01Icon}
        label="Scan"
        onPress={() => {
          hapticSelection();
        }}
      />
      <Fab.Item
        icon={UserAdd01Icon}
        label="Add Friend"
        onPress={() => {
          hapticSelection();
        }}
      />
      <Fab.Item
        icon={AddInvoiceIcon}
        label="Create Split"
        onPress={() => {
          hapticSelection();
        }}
      />
    </Fab>
  );
};

export default SplitFab;

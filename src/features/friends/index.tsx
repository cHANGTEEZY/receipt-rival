import CollapsingLargeHeader from "@/components/layouts/CollapsingLargeHeader";
import MeshBackground from "@/components/MeshBackground";
import SplitFab from "@/components/SplitFab";
import { View } from "react-native";
import EmptyFriendComponent from "./components/EmptyFriendComponent";

const Friends = () => {
  return (
    <View className="flex-1 bg-background">
      <MeshBackground />
      <CollapsingLargeHeader title="Friends">
        <View className="gap-4 px-4">
          <EmptyFriendComponent />
        </View>
        <SplitFab />
      </CollapsingLargeHeader>
    </View>
  );
};

export default Friends;

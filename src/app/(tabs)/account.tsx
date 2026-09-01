import AccountCard from "@/components/AccountCard";
import HistoryCard from "@/components/HistoryCard";
import PreferenceCard from "@/components/PreferenceCard";
import { ScrollView, View } from "react-native";

export default function AccountScreen() {
  return (
    <View className="flex-1 bg-[#18181B]">
      <ScrollView
        className="flex-1"
        contentContainerClassName="pt-14 pb-28 px-5 items-center gap-6"
        showsVerticalScrollIndicator={false}
      >
        <AccountCard />
        <PreferenceCard />
        <HistoryCard />
      </ScrollView>
    </View>
  );
}

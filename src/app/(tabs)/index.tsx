import QuickLocationCard from "@/components/QuickLocationCard";
import RealTimeInfoCard from "@/components/RealTimeInfoCard";
import RouteCard from "@/components/RouteCard";
import Text from "@/components/Text";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, ScrollView, View } from "react-native";

export default function Index() {
  return (
    <View className="flex-1 bg-[#18181B]">
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-5 items-center gap-6 py-28"
        showsVerticalScrollIndicator={false}
      >
        {/* Greetings */}
        <View className="gap-2.5">
          <Text className="text-4xl font-bold text-light-1 text-center">
            SmartRoute AI
          </Text>
          <Text className="text-light-2 text-center">
            Hai, Selamat Pagi!{"\n"}Mau ke mana hari ini?
          </Text>
        </View>

        {/* Form Card Input Rute */}
        <RouteCard />

        {/* Tombol Action Utama */}
        <Pressable
          onPress={() => {}}
          className="w-full bg-[#00875A] py-3.5 rounded-2xl flex-row items-center justify-center gap-2 active:opacity-80"
        >
          <Ionicons name="search" size={20} color="#FFFFFF" />
          <Text className="text-light-1 font-bold text-md">
            Cari Rute Terbaik
          </Text>
        </Pressable>

        {/* Tujuan Cepat */}
        <View className="gap-4 w-full">
          <Text className="text-md w-full text-left text-light-1 font-bold">
            Tujuan Cepat
          </Text>
          <View className="flex-row gap-4">
            <QuickLocationCard title="Kantor" iconName="briefcase" />
            <QuickLocationCard title="Kampus" iconName="school" />
            <QuickLocationCard title="Rumah" iconName="home" />
          </View>
        </View>

        {/* Info Real Time */}
        <View className="gap-4 w-full">
          <Text className="text-md w-full text-left text-light-1 font-bold">
            Informasi
          </Text>
          <View className="gap-4">
            <RealTimeInfoCard />
            <RealTimeInfoCard />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

import { Ionicons } from "@expo/vector-icons";
import { View } from "react-native";
import Text from "./Text";

export default function RouteCard() {
  return (
    <View className="w-full bg-dark-4 px-4 py-4 rounded-xl gap-2.5">
      <Text className="text-light-2 text-md">Dari</Text>
      <View className="flex-row items-center gap-2">
        <Ionicons name="location" size={19} color={"#FFFFFF"} />
        <Text className="text-light-1 font-bold text-lg">Lokasi Anda</Text>
      </View>
      <View className="flex-row gap-4 items-center">
        <View className="flex-1 h-[2px] rounded-xl bg-light-1/30"></View>
        <Ionicons name="swap-vertical" size={24} color={"#FFFFFF"} />
      </View>
      <Text className="text-light-2 text-md">Tujuan</Text>
      <View className="flex-row items-center gap-2">
        <Ionicons name="location" size={19} color={"#FFFFFF"} />
        <Text className="text-light-1 font-bold text-lg">Tujuan Anda</Text>
      </View>
    </View>
  );
}

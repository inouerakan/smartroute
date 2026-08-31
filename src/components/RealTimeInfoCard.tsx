import { Ionicons } from "@expo/vector-icons";
import { View } from "react-native";
import Text from "./Text";

const RealTimeInfoCard = () => {
  return (
    <View className="w-full bg-dark-2 rounded-2xl p-4 flex-row items-center gap-3">
      <View className="bg-light-1/20 p-2.5 rounded-xl">
        <Ionicons name="warning" size={30} color="#FFFFFF" />
      </View>
      <View className="flex-1 gap-0.5">
        <Text className="text-light-1 font-bold text-md">Lalu Lintas</Text>
        <Text className="text-light-3 text-sm">
          Jalur KRL & TransJakarta beroperasi normal pagi ini.
        </Text>
      </View>
    </View>
  );
};

export default RealTimeInfoCard;

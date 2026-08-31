import { routeOptionProp } from "@/type";
import { Ionicons } from "@expo/vector-icons";
import { View } from "react-native";
import Text from "./Text";

export default function RouteDetailCard({ item }: routeOptionProp) {
  const modeMap = {
    walk: "Jalan kaki",
    transjakarta: "Naik TransJakarta",
    mrt: "Naik MRT",
    jaklingko: "Naik JakLingko",
  };

  return (
    <View className="bg-dark-2 border border-light-1/10 rounded-xl">
      <View className="flex-1 flex-row bg-dark-4 p-4 justify-between rounded-t-xl">
        <Text className="text-md font-bold text-light-1 bg-light-1/50 px-4 py-2 leading-tight rounded-xl capitalize">
          {item.type}
        </Text>
        <Text
          className={`text-xl ${item.rating > 8 ? "text-primary-emerald" : "text-accent"} font-bold`}
        >
          {item.rating}/10
        </Text>
      </View>
      <View className="p-4 gap-1">
        {item.transitSequence.map((order, index) => (
          <View key={index} className="flex-row">
            <View className="w-1/5 items-center">
              {index === 0 ? (
                <Ionicons name="time" color="#FFFFFF" size={22} />
              ) : (
                <Text className="text-light-2 text-md">8:15</Text>
              )}
            </View>
            <View className="items-center gap-1">
              <Ionicons name="location" color="#FFFFFF" size={22} />
              <View className="w-0.5 bg-light-3 flex-1 rounded-xl" />
            </View>
            <View className="flex-1 px-4 pb-4">
              <Text className="text-md text-light-1 font-bold">
                {index === 0
                  ? "Lokasi Anda"
                  : item.transitSequence[index - 1].destination}
              </Text>
              <Text className="text-sm text-light-2">
                {modeMap[order.mode]} menuju{" "}
                {index === 0
                  ? order.destination
                  : item.transitSequence[index].destination}
              </Text>
            </View>
          </View>
        ))}
        <View className="flex-row">
          <View className="w-1/5 items-center">
            <Text className="text-light-2">8:15</Text>
          </View>
          <View className="items-center gap-1">
            <Ionicons name="location" color="#FFFFFF" size={22} />
            <View className="w-0.5 bg-light-3 h-0 rounded-xl" />
          </View>
          <View className="flex-1 px-4">
            <Text className="text-md text-light-1 font-bold">Tujuan Anda</Text>
            <Text className="text-sm text-light-2">Sampai dengan selamat</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

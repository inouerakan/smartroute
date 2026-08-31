import { Image, View } from "react-native";
import Text from "./Text";

export default function AccountCard() {
  return (
    <View className="flex-row items-center gap-4 bg-light-1 border border-dark-1 w-full px-4 py-4 rounded-xl">
      <Image className="w-14 aspect-square bg-light-3 black rounded-full"></Image>
      <View className="gap-1">
        <Text className="text-dark-2 text-sm">Tipe Perjalananmu</Text>
        <Text className="text-dark-1 font-bold text-md">Hemat & Nyaman</Text>
      </View>
    </View>
  );
}

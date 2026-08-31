import { View } from "react-native";
import Text from "./Text";

type InfoProps = {
  title: string;
  desc: string;
};

export default function InfoCard({ title, desc }: InfoProps) {
  return (
    <View className="bg-dark-2 px-4 py-4 rounded-xl justify-center items-center flex-1 gap-2 border border-light-1/10">
      <Text className="text-light-1 font-bold text-xl text-center">
        {title}
      </Text>
      <Text className="text-light-2 text-sm text-center">{desc}</Text>
    </View>
  );
}

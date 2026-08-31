import { Ionicons } from "@expo/vector-icons";
import { Pressable } from "react-native";
import Text from "./Text";

interface QuickLocationCardProps {
  title: string;
  iconName?: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
}

export default function QuickLocationCard({
  title = "Kantor",
  iconName = "briefcase-sharp",
  onPress,
}: QuickLocationCardProps) {
  return (
    <Pressable
      onPress={onPress}
      className="bg-dark-2 flex-1 rounded-2xl items-center justify-center p-5 shadow-card active:opacity-70"
    >
      <Ionicons name={iconName} size={24} color="#FFFFFF" />
      <Text
        className="text-light-1 text-md font-semibold mt-2 text-center"
        numberOfLines={1}
      >
        {title}
      </Text>
    </Pressable>
  );
}

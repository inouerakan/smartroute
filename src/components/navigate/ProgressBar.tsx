// src/components/navigate/ProgressBar.tsx
import Text from "@/components/Text";
import { View } from "react-native";

interface ProgressBarProps {
  percentage: number;
  isFinished: boolean;
}

export default function ProgressBar({
  percentage,
  isFinished,
}: ProgressBarProps) {
  return (
    <View className="w-full gap-2">
      <View className="flex-row justify-between items-center">
        <Text className="text-light-3 text-xs font-semibold">
          {isFinished ? "Perjalanan Selesai" : "Progres Perjalanan"}
        </Text>
        <Text
          className={`${isFinished ? "text-primary-emerald" : "text-light-1"} text-xs font-bold`}
        >
          {percentage}%
        </Text>
      </View>
      <View className="w-full h-1.5 bg-dark-4 rounded-full overflow-hidden">
        <View
          className={`h-full rounded-full ${isFinished ? "bg-primary-emerald" : "bg-light-1"}`}
          style={{ width: `${percentage}%` }}
        />
      </View>
    </View>
  );
}

// src/app/route.tsx
import Text from "@/components/Text";
import { mockApiResponse } from "@/data/mockRoutes";
import { RouteItem } from "@/type";
import { FontAwesome6, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, View } from "react-native";

// Helper untuk menentukan label tipe berdasarkan karakteristik rute
const getRouteTypeLabel = (item: RouteItem): string => {
  if (item.recommendation_score >= 0.9) return "Rekomendasi";
  if (item.travel_time_minutes <= 30) return "Cepat";
  if (item.cost_idr <= 4000) return "Murah";
  if (item.crowd.predicted_level === "LOW") return "Tenang";
  return "Nyaman";
};

const getModeIcon = (mode: string) => {
  switch (mode.toLowerCase()) {
    case "walk":
      return <Ionicons name="walk" size={18} color="#FFFFFF" />;
    case "transjakarta":
      return <Ionicons name="bus" size={18} color="#FFFFFF" />;
    case "mrt":
      return <Ionicons name="train" size={18} color="#FFFFFF" />;
    case "krl":
      return <Ionicons name="train" size={18} color="#FFFFFF" />;
    case "jaklingko":
      return <FontAwesome6 name="van-shuttle" size={16} color="#FFFFFF" />;
    default:
      return <Ionicons name="navigate" size={18} color="#FFFFFF" />;
  }
};

const RouteOptionCard = ({
  item,
  originName,
}: {
  item: RouteItem;
  originName: string;
}) => {
  const router = useRouter();
  const typeLabel = getRouteTypeLabel(item);

  // Warna rating berdasarkan skor rekomendasi (0-1 -> 0-10)
  const score10 = Math.round(item.recommendation_score * 10);
  const scoreColor =
    score10 >= 8
      ? "text-primary-emerald"
      : score10 >= 6
        ? "text-yellow-400"
        : "text-accent";

  return (
    <Pressable
      onPress={() =>
        router.push({
          pathname: "/route/[id]",
          params: {
            data: JSON.stringify(item),
            origin: originName,
          },
        })
      }
      className="bg-dark-2 px-4 py-4 gap-3 rounded-xl active:opacity-95 border border-light-3/5"
    >
      <View className="flex-row justify-between items-center">
        <Text className="bg-light-1/10 font-bold text-light-1 text-xs px-2.5 py-1 rounded-md capitalize border border-light-1/10">
          {typeLabel}
        </Text>
        {item.crowd.predicted_level === "HIGH" && (
          <View className="flex-row items-center gap-1 bg-red-500/20 px-2 py-0.5 rounded">
            <Ionicons name="people" size={12} color="#EF4444" />
            <Text className="text-red-400 text-[10px] font-bold">PADAT</Text>
          </View>
        )}
      </View>

      <View className="flex-row items-center justify-between">
        <View className="flex-row gap-1.5 items-center flex-1">
          {item.legs.map((leg, index) => {
            const isLast = index === item.legs.length - 1;
            return (
              <View key={index} className="flex-row items-center gap-1">
                {getModeIcon(leg.mode)}
                {!isLast && (
                  <Ionicons name="chevron-forward" size={14} color="#52525B" />
                )}
              </View>
            );
          })}
        </View>
        <Text className={`font-bold text-xl ${scoreColor}`}>
          {score10}
          <Text className="text-sm text-light-3">/10</Text>
        </Text>
      </View>

      <View className="flex-row justify-between items-center pt-1 border-t border-light-3/10">
        <View className="flex-row gap-3">
          <View className="flex-row items-center gap-1">
            <Ionicons name="time-outline" size={14} color="#A1A1AA" />
            <Text className="text-xs text-light-2">
              {item.travel_time_minutes} mnt
            </Text>
          </View>
          <View className="flex-row items-center gap-1">
            <Ionicons name="swap-horizontal" size={14} color="#A1A1AA" />
            <Text className="text-xs text-light-2">
              {item.transfers}x transit
            </Text>
          </View>
        </View>
        <Text className="text-sm font-semibold text-light-1">
          Rp {item.cost_idr.toLocaleString()}
        </Text>
      </View>
    </Pressable>
  );
};

export default function RouteScreen() {
  const [selectedFilter, setSelectedFilter] = useState("Semua");
  const filters = ["Semua", "Rekomendasi", "Cepat", "Murah", "Tenang"];

  const filteredRoutes = mockApiResponse.routes
    .filter((item) => {
      if (selectedFilter === "Semua") return true;
      return getRouteTypeLabel(item) === selectedFilter;
    })
    .sort((a, b) => b.recommendation_score - a.recommendation_score);

  return (
    <View className="flex-1 bg-[#18181B]">
      <ScrollView
        contentContainerClassName="px-5 pt-14 pb-28 gap-6"
        showsVerticalScrollIndicator={false}
      >
        <View className="gap-2">
          <Text className="text-3xl font-bold text-light-1">Hasil Rute</Text>
          <Text className="text-light-2 text-sm">
            {mockApiResponse.origin.name} → {mockApiResponse.destination.name}
          </Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="gap-2"
        >
          {filters.map((f) => (
            <Pressable key={f} onPress={() => setSelectedFilter(f)}>
              <Text
                className={`${selectedFilter === f ? "bg-light-1 text-dark-1" : "bg-dark-4 text-light-2"} font-semibold text-xs px-4 py-2 rounded-full border border-light-3/10`}
              >
                {f}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        <View className="gap-3">
          {filteredRoutes.map((item) => (
            <RouteOptionCard
              key={item.route_id}
              item={item}
              originName={mockApiResponse.origin.name}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

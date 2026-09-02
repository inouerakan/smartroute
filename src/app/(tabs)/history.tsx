import InfoCard from "@/components/InfoCard";
import Text from "@/components/Text";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, ScrollView, SectionList, View } from "react-native";

type HistoryItem = {
  id: string;
  asal: string;
  tujuan: string;
  waktu: string;
  harga: string;
  rating: string;
  durasi: string;
  transportType: string;
};

type HistorySection = {
  title: string;
  data: HistoryItem[];
};

const SECTIONS_DATA: HistorySection[] = [
  {
    title: "Juni 2026",
    data: [
      {
        id: "1",
        asal: "JIS",
        tujuan: "Bundaran HI",
        waktu: "Kam, 13 Jun, 08:40",
        harga: "Rp. 14.000",
        rating: "8.7/10",
        durasi: "60 Menit",
        transportType: "Multi-moda",
      },
      {
        id: "2",
        asal: "Dukuh Atas",
        tujuan: "Lebak Bulus",
        waktu: "Rab, 12 Jun, 17:15",
        harga: "Rp. 10.000",
        rating: "9.0/10",
        durasi: "30 Menit",
        transportType: "MRT",
      },
      {
        id: "3",
        asal: "Blok M",
        tujuan: "Kota",
        waktu: "Sen, 08 Jun, 07:30",
        harga: "Rp. 3.500",
        rating: "8.5/10",
        durasi: "45 Menit",
        transportType: "Transjakarta",
      },
    ],
  },
  {
    title: "Mei 2026",
    data: [
      {
        id: "4",
        asal: "Harmoni",
        tujuan: "Ragunan",
        waktu: "Sab, 30 Mei, 14:00",
        harga: "Rp. 3.500",
        rating: "8.0/10",
        durasi: "50 Menit",
        transportType: "Transjakarta",
      },
      {
        id: "5",
        asal: "Fatmawati",
        tujuan: "Istora Mandiri",
        waktu: "Kam, 21 Mei, 09:10",
        harga: "Rp. 8.000",
        rating: "9.2/10",
        durasi: "20 Menit",
        transportType: "MRT",
      },
      {
        id: "6",
        asal: "Manggarai",
        tujuan: "Bandara Soekarno-Hatta",
        waktu: "Min, 10 Mei, 11:20",
        harga: "Rp. 50.000",
        rating: "9.5/10",
        durasi: "40 Menit",
        transportType: "Multi-moda",
      },
    ],
  },
];

export default function HistoryScreen() {
  const transportTypes = ["Semua", "MRT", "Transjakarta", "Multi-moda"];
  const [selectedType, setSelectedType] = useState("Semua");

  const filteredSections = SECTIONS_DATA.map((section) => ({
    ...section,
    data: section.data.filter(
      (item) => selectedType === "Semua" || item.transportType === selectedType,
    ),
  })).filter((section) => section.data.length > 0);

  const renderHistoryCard = ({ item }: { item: HistoryItem }) => (
    <View className="bg-dark-2 p-4 rounded-xl mb-3 shadow-sm">
      <View className="flex-row justify-between items-center">
        <View className="flex-row items-center gap-2 max-w-[70%]">
          <Text
            numberOfLines={1}
            ellipsizeMode="tail"
            className="text-light-1 font-bold text-base"
          >
            {item.asal}
          </Text>
          <View className="w-3 h-[2px] bg-light-1 rounded-full" />
          <Text
            numberOfLines={1}
            ellipsizeMode="tail"
            className="text-light-1 font-bold text-base shrink"
          >
            {item.tujuan}
          </Text>
        </View>
        <Text className="text-light-1 font-bold text-base">{item.harga}</Text>
      </View>

      <View className="flex-row justify-between items-center mt-1">
        <Text className="text-light-3 text-xs">{item.waktu}</Text>
        <Text
          className={`${parseInt(item.rating) > 8 ? "text-primary-emerald" : "text-accent"} text-xs font-semibold`}
        >
          {item.rating}
        </Text>
      </View>

      <View className="flex-row items-center justify-between mt-3">
        <View className="flex-row items-center gap-3">
          <Ionicons name="walk" size={18} color="#FFFFFF" />
          <Ionicons name="bus" size={18} color="#FFFFFF" />
          <Ionicons name="train" size={20} color="#FFFFFF" />
        </View>
        <View className="bg-light-1/20 px-3 py-1.5 rounded-full">
          <Text className="text-light-1 text-xs font-bold">{item.durasi}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-[#18181B]">
      <SectionList
        sections={filteredSections}
        renderItem={renderHistoryCard}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pt-14 pb-28 px-5"
        renderSectionHeader={({ section: { title } }) => (
          <Text className="text-md text-light-1 font-bold my-3 py-1">
            {title}
          </Text>
        )}
        ListHeaderComponent={
          <View className="gap-6 mb-2">
            {/* Cards Ringkasan */}
            <View className="flex-row gap-2">
              <InfoCard title="24" desc="Perjalanan" />
              <InfoCard title="Rp. 336rb" desc="Total Hemat" />
              <InfoCard title="28.8 kg" desc="CO2 Hemat" />
            </View>

            {/* Filter Categories - UPDATED MATCHING route.tsx */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerClassName="gap-2"
            >
              {transportTypes.map((item) => (
                <Pressable key={item} onPress={() => setSelectedType(item)}>
                  <Text
                    className={`${selectedType === item ? "bg-light-1 text-dark-1" : "bg-dark-4 text-light-2"} font-semibold text-xs px-4 py-2 rounded-full border border-light-3/10`}
                  >
                    {item}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        }
      />
    </View>
  );
}

import { useRouter } from "expo-router";
import { Pressable, View } from "react-native";
import Text from "./Text";

interface HistoryItemProps {
  origin: string;
  destination: string;
  date: string;
  showBorder?: boolean;
}

function HistoryItem({
  origin,
  destination,
  date,
  showBorder = true,
}: HistoryItemProps) {
  return (
    <View
      className={`flex-row justify-between items-center py-3.5 ${
        showBorder ? "border-b border-white/10" : ""
      }`}
    >
      {/* Detail Rute & Tanggal */}
      <View className="flex-1 mr-3 gap-0.5">
        <Text className="text-light-2 text-sm font-semibold" numberOfLines={1}>
          {origin} → {destination}
        </Text>
        <Text className="text-light-3 text-xs font-medium">{date}</Text>
      </View>
    </View>
  );
}

export default function HistoryCard() {
  const router = useRouter();
  const historyList = [
    {
      id: "1",
      origin: "Stasiun Bandung",
      destination: "Alun-Alun Bandung",
      date: "24 Aug 2026",
      fare: "Rp 5.000",
    },
    {
      id: "2",
      origin: "Lebak Bulus",
      destination: "Bundaran HI",
      date: "20 Aug 2026",
      fare: "Rp 14.000",
    },
    {
      id: "3",
      origin: "Blok M",
      destination: "Monas",
      date: "18 Aug 2026",
      fare: "Rp 3.500",
    },
  ];

  return (
    <View className="bg-dark-2 w-full px-5 py-4 rounded-2xl border border-white/10">
      <View className="w-full flex-row justify-between items-center">
        <Text className="text-light-1 font-bold text-lg mb-1">
          Riwayat Perjalanan
        </Text>
        <Pressable
          className="active:opacity-60"
          onPress={() => router.push("/history")}
        >
          <Text className="text-light-3 text-sm mb-1">Lihat Semua</Text>
        </Pressable>
      </View>

      <View className="w-full">
        {historyList.map((item, index) => (
          <HistoryItem
            key={item.id}
            origin={item.origin}
            destination={item.destination}
            date={item.date}
            showBorder={index !== historyList.length - 1}
          />
        ))}
      </View>
    </View>
  );
}

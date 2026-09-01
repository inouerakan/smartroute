import Text from "@/components/Text";
import { routeOptionItem, routeOptionProp, travelTypeProps } from "@/type";
import { FontAwesome6, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, View } from "react-native";

const ORIGIN = "Manggarai";
const DESTINATION = "JIS";

const routeOptions: routeOptionItem[] = [
  {
    id: 1,
    origin: ORIGIN,
    transitSequence: [
      { mode: "walk", destination: "Stasiun Manggarai" },
      { mode: "transjakarta", destination: "Halte Sunter Kelapa Gading" },
      { mode: "jaklingko", destination: "Halte JIS" },
      { mode: "walk", destination: "JIS" },
    ],
    totalTime: 55,
    fare: 7000,
    rating: 8.7,
    type: "nyaman",
  },
  {
    id: 2,
    origin: ORIGIN,
    transitSequence: [
      { mode: "walk", destination: "Stasiun Manggarai" },
      { mode: "mrt", destination: "Stasiun Bundaran HI" },
      { mode: "transjakarta", destination: "Halte JIS" },
      { mode: "walk", destination: "JIS" },
    ],
    totalTime: 65,
    fare: 12000,
    rating: 8.2,
    type: "cepat",
  },
  {
    id: 3,
    origin: ORIGIN,
    transitSequence: [
      { mode: "walk", destination: "Halte Manggarai" },
      { mode: "transjakarta", destination: "Halte Monas" },
      { mode: "transjakarta", destination: "Halte JIS" },
      { mode: "walk", destination: "JIS" },
    ],
    totalTime: 70,
    fare: 3500,
    rating: 8.0,
    type: "tenang",
  },
  {
    id: 4,
    origin: ORIGIN,
    transitSequence: [
      { mode: "walk", destination: "Stasiun Manggarai" },
      { mode: "jaklingko", destination: "Halte Pasar Genjing" },
      { mode: "transjakarta", destination: "Halte JIS" },
      { mode: "walk", destination: "JIS" },
    ],
    totalTime: 75,
    fare: 3500,
    rating: 7.8,
    type: "murah",
  },
  {
    id: 5,
    origin: ORIGIN,
    transitSequence: [
      { mode: "walk", destination: "Halte Manggarai" },
      { mode: "jaklingko", destination: "Halte Cempaka Mas" },
      { mode: "transjakarta", destination: "Halte JIS" },
      { mode: "walk", destination: "JIS" },
    ],
    totalTime: 80,
    fare: 3500,
    rating: 7.0,
    type: "murah",
  },
  {
    id: 6,
    origin: ORIGIN,
    transitSequence: [
      { mode: "walk", destination: "Stasiun Manggarai" },
      { mode: "mrt", destination: "Stasiun Dukuh Atas" },
      { mode: "transjakarta", destination: "Halte JIS" },
      { mode: "walk", destination: "JIS" },
    ],
    totalTime: 60,
    fare: 10000,
    rating: 8.5,
    type: "nyaman",
  },
  {
    id: 7,
    origin: ORIGIN,
    transitSequence: [
      { mode: "walk", destination: "Stasiun Manggarai" },
      { mode: "jaklingko", destination: "Halte Ancol" },
      { mode: "walk", destination: "JIS" },
    ],
    totalTime: 50,
    fare: 8000,
    rating: 8.9,
    type: "cepat",
  },
];

const modeMap = {
  walk: () => <Ionicons name="walk" size={20} color="#FFFFFF" />,
  transjakarta: () => <Ionicons name="bus" size={20} color="#FFFFFF" />,
  mrt: () => <Ionicons name="train" size={20} color="#FFFFFF" />,
  jaklingko: () => (
    <FontAwesome6 name="van-shuttle" size={20} color="#FFFFFF" />
  ),
};

const TravelTypeButton = ({ name, current, onPress }: travelTypeProps) => (
  <Pressable onPress={() => onPress(name)}>
    <Text
      className={`${current === name ? "bg-light-1 text-dark-1" : "bg-dark-4 text-light-1"} font-bold border border-light-3/20 px-4 py-2 rounded-xl leading-tight`}
    >
      {name}
    </Text>
  </Pressable>
);

const RouteOptionCard = ({ item }: routeOptionProp) => {
  const router = useRouter();
  return (
    <Pressable
      onPress={() =>
        router.push({
          pathname: "/route/[id]",
          params: { data: JSON.stringify(item) },
        })
      }
      className="bg-dark-2 px-4 py-4 gap-2 rounded-xl active:opacity-95"
    >
      <Text className="bg-light-1/25 font-bold mr-auto text-light-1 text-sm px-2 leading-tight py-1 rounded-md capitalize">
        {item.type}
      </Text>
      <View className="flex-1 flex-row items-center justify-between">
        <View className="flex-row gap-1">
          {item.transitSequence.map((order, index) => {
            const IconComponent = modeMap[order.mode as keyof typeof modeMap];
            const isLast = index === item.transitSequence.length - 1;
            return (
              <View key={index} className="flex-row gap-1 items-center">
                {IconComponent ? IconComponent() : null}
                {!isLast && <Ionicons name="chevron-forward" color="#FFFFFF" />}
              </View>
            );
          })}
        </View>
        <Text
          className={`font-bold text-2xl ${item.rating < 8 ? "text-accent" : "text-primary-emerald"}`}
        >{`${item.rating}/10`}</Text>
      </View>
      <View className="flex-1 flex-row justify-between">
        <Text className="text-sm text-light-2">{`${item.totalTime} Menit`}</Text>
        <Text className="text-sm text-light-2">{`Rp. ${item.fare}`}</Text>
      </View>
    </Pressable>
  );
};

export default function RouteScreen() {
  const travelTypes = ["Semua", "Tenang", "Murah", "Cepat", "Nyaman"];
  const [selectedTravelType, setSelectedTravelType] = useState("Semua");

  const filteredRouteOptions = routeOptions
    .filter(
      (item) =>
        selectedTravelType === "Semua" ||
        item.type === selectedTravelType.toLocaleLowerCase(),
    )
    .sort((a, b) => b.rating - a.rating);

  return (
    <View className="flex-1 bg-[#18181B]">
      <ScrollView
        contentContainerClassName="px-5 pt-14 pb-28 gap-6"
        showsVerticalScrollIndicator={false}
      >
        <View className="gap-2.5">
          <Text className="text-4xl font-bold text-light-1 text-center">
            Hasil Rute
          </Text>
          <Text className="text-light-2 text-center">
            Rute Anda adalah{"\n"}
            {ORIGIN} — {DESTINATION}
          </Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="gap-2"
        >
          {travelTypes.map((item) => (
            <TravelTypeButton
              key={item}
              name={item}
              current={selectedTravelType}
              onPress={setSelectedTravelType}
            />
          ))}
        </ScrollView>
        <View className="gap-4">
          {filteredRouteOptions.map((item) => (
            <RouteOptionCard key={item.id} item={item} />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

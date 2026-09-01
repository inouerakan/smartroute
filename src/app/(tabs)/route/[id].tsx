import ComparisonCard from "@/components/ComparisonCard";
import InfoCard from "@/components/InfoCard";
import RouteDetailCard from "@/components/RouteDetailCard";
import Text from "@/components/Text";
import { routeOptionItem } from "@/type";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, ScrollView, View } from "react-native";

export default function RouteDetailScreen() {
  const { data } = useLocalSearchParams<{ data: string }>();
  const routeData: routeOptionItem = JSON.parse(data);
  const router = useRouter();

  return (
    <View className="flex-1 bg-[#18181B]">
      <ScrollView contentContainerClassName="px-5 pt-14 pb-28 gap-6">
        <RouteDetailCard item={routeData} />
        <View className="flex-row gap-2">
          <InfoCard title={String(routeData.totalTime)} desc="Est. Durasi" />
          <InfoCard
            title={`${routeData.transitSequence.length}×`}
            desc="Transit"
          />
          <InfoCard title={`Rp. ${routeData.fare}`} desc="Est. Biaya" />
        </View>
        <View className="w-full flex-row gap-2">
          <Pressable
            // Di dalam Pressable "Mulai Navigasi", ganti onPress menjadi:
            onPress={() =>
              router.push({
                pathname: "/navigate",
                params: {
                  data: JSON.stringify(routeData),
                  origin: routeData.origin, // ← TAMBAHKAN INI
                },
              })
            }
            className="flex-1 items-center py-4 rounded-xl leading-tight bg-light-1"
          >
            <Text className="text-md text-dark-1 font-bold">
              Mulai Navigasi
            </Text>
          </Pressable>
          <Pressable className="flex-1 items-center py-4 rounded-xl leading-tight bg-light-1">
            <Text className="text-md text-dark-1 font-bold">
              Periksa Kondisi
            </Text>
          </Pressable>
        </View>
        <View className="w-full items-center">
          <Text className="text-light-1 text-sm text-center w-2/3">
            Dengan memilih transportasi publik, kamu membantu mengurangi emisi
            1,2 KG CO2 untuk perjalanan ini.
          </Text>
        </View>
        <ComparisonCard />
      </ScrollView>
    </View>
  );
}

import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import "../../global.css";

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    "Plus-Jakarta-Sans": require("@/assets/fonts/PlusJakartaSans-VariableFont_wght.ttf"),
  });

  if (!fontsLoaded) {
    return (
      <View className="flex-1 justify-center items-center bg-[#001D4A]">
        <ActivityIndicator size={"large"} color={"#ffffff"} />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#18181B]">
      {/* <Header /> */}
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
      </Stack>
    </View>
  );
}

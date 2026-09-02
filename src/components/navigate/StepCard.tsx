// src/components/navigate/StepCard.tsx
import Text from "@/components/Text";
import { RouteItem } from "@/type";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, View } from "react-native";
import ProgressBar from "./ProgressBar";

type LegType = RouteItem["legs"][number];

interface StepCardProps {
  currentLeg: LegType | null;
  totalSteps: number;
  currentStepIndex: number;
  isFinished: boolean;
  fromName: string;
  progressPercentage: number;
  routeData: RouteItem;
  onNext: () => void;
  onPrev: () => void;
  onFinish: () => void;
  onBack: () => void; // <-- Prop baru untuk tombol kembali
}

export default function StepCard({
  currentLeg,
  totalSteps,
  currentStepIndex,
  isFinished,
  fromName,
  progressPercentage,
  routeData,
  onNext,
  onPrev,
  onFinish,
  onBack, // <-- Destructure prop baru
}: StepCardProps) {
  const [activeTab, setActiveTab] = useState<"navigation" | "info">(
    "navigation",
  );

  const getStepIcon = (mode: string) => {
    const m = mode.toLowerCase();
    if (m === "walk") return <Ionicons name="walk" size={24} color="#00875A" />;
    if (m === "transjakarta" || m === "jaklingko")
      return <Ionicons name="bus" size={24} color="#3B82F6" />;
    if (m === "mrt" || m === "krl")
      return <Ionicons name="train" size={24} color="#EAB308" />;
    return <Ionicons name="navigate-outline" size={24} color="#FFFFFF" />;
  };

  const getCrowdColor = (level: string) => {
    switch (level) {
      case "LOW":
        return "text-green-400";
      case "MEDIUM":
        return "text-yellow-400";
      case "HIGH":
        return "text-red-400";
      default:
        return "text-light-2";
    }
  };

  const getCrowdBg = (level: string) => {
    switch (level) {
      case "LOW":
        return "bg-green-500/20";
      case "MEDIUM":
        return "bg-yellow-500/20";
      case "HIGH":
        return "bg-red-500/20";
      default:
        return "bg-dark-4";
    }
  };

  return (
    <View className="absolute bottom-8 left-5 right-5 bg-dark-2 p-5 rounded-2xl gap-4 shadow-2xl border border-light-3/10">
      {/* Progress Bar tetap muncul di atas sebagai indikator 100% */}
      <ProgressBar percentage={progressPercentage} isFinished={isFinished} />

      {isFinished ? (
        // --- TAMPILAN SELESAI (FULL CARD REPLACEMENT) ---
        <View className="items-center gap-4 py-2">
          <View className="w-16 h-16 bg-primary-emerald/20 rounded-full items-center justify-center mb-1">
            <Ionicons name="checkmark-circle" size={40} color="#00875A" />
          </View>

          <View className="items-center gap-1">
            <Text className="text-light-1 font-bold text-xl text-center">
              Sampai Tujuan!
            </Text>
            <Text className="text-light-3 text-sm text-center px-4">
              Anda telah tiba di{" "}
              {routeData.legs[routeData.legs.length - 1]?.to ?? "Tujuan"}
            </Text>
          </View>

          {/* Tombol Kembali di DALAM Card */}
          <Pressable
            onPress={onBack}
            className="w-full py-3.5 rounded-xl items-center justify-center bg-light-1 mt-2 active:opacity-90"
          >
            <Text className="text-dark-1 font-bold text-base">
              Kembali ke Beranda
            </Text>
          </Pressable>
        </View>
      ) : (
        // --- TAMPILAN NAVIGASI / INFO (BELUM SELESAI) ---
        <>
          {/* Segmented Control */}
          <View className="flex-row bg-dark-4 rounded-xl p-1 gap-1">
            <Pressable
              onPress={() => setActiveTab("navigation")}
              className={`flex-1 py-2 rounded-lg flex-row items-center justify-center gap-1.5 ${
                activeTab === "navigation" ? "bg-[#00875A]" : "bg-transparent"
              }`}
            >
              <Ionicons
                name="navigate"
                size={16}
                color={activeTab === "navigation" ? "#FFF" : "#71717A"}
              />
              <Text
                className={`text-xs font-bold ${activeTab === "navigation" ? "text-white" : "text-light-3"}`}
              >
                Navigasi
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setActiveTab("info")}
              className={`flex-1 py-2 rounded-lg flex-row items-center justify-center gap-1.5 ${
                activeTab === "info" ? "bg-[#00875A]" : "bg-transparent"
              }`}
            >
              <Ionicons
                name="people"
                size={16}
                color={activeTab === "info" ? "#FFF" : "#71717A"}
              />
              <Text
                className={`text-xs font-bold ${activeTab === "info" ? "text-white" : "text-light-3"}`}
              >
                Info Crowd
              </Text>
            </Pressable>
          </View>

          {activeTab === "info" ? (
            // --- TAB INFO CROWD ---
            <View className="py-2 gap-4">
              <View className="flex-row items-center justify-between">
                <Text className="text-light-2 text-sm font-semibold">
                  Status Keramaian
                </Text>
                <View
                  className={`px-2 py-1 rounded ${getCrowdBg(routeData.crowd.current_level)}`}
                >
                  <Text
                    className={`text-xs font-bold ${getCrowdColor(routeData.crowd.current_level)}`}
                  >
                    {routeData.crowd.current_level}
                  </Text>
                </View>
              </View>

              <View className="gap-2">
                <View className="flex-row justify-between text-xs">
                  <Text className="text-light-3">Okupansi Prediksi</Text>
                  <Text className="text-light-1 font-bold">
                    {routeData.crowd.predicted_occupancy}%
                  </Text>
                </View>
                <View className="h-2 bg-dark-4 rounded-full overflow-hidden">
                  <View
                    className={`h-full rounded-full ${
                      routeData.crowd.predicted_occupancy > 80
                        ? "bg-red-500"
                        : routeData.crowd.predicted_occupancy > 50
                          ? "bg-yellow-500"
                          : "bg-green-500"
                    }`}
                    style={{ width: `${routeData.crowd.predicted_occupancy}%` }}
                  />
                </View>
              </View>

              <View className="bg-dark-4/50 p-3 rounded-lg border border-light-3/5 gap-2">
                <View className="flex-row items-center gap-2">
                  <Ionicons
                    name="analytics-outline"
                    size={16}
                    color="#A1A1AA"
                  />
                  <Text className="text-light-2 text-xs">
                    Prediksi berikutnya:{" "}
                    <Text className="text-light-1 font-bold">
                      {routeData.crowd.predicted_level}
                    </Text>
                  </Text>
                </View>
                <View className="flex-row items-center gap-2">
                  <Ionicons
                    name="shield-checkmark-outline"
                    size={16}
                    color="#A1A1AA"
                  />
                  <Text className="text-light-2 text-xs">
                    Reliabilitas:{" "}
                    <Text className="text-light-1 font-bold">
                      {Math.round(routeData.reliability.score * 100)}%
                    </Text>
                  </Text>
                </View>
              </View>
            </View>
          ) : (
            // --- TAB NAVIGASI BIASA ---
            <>
              <View className="flex-row items-center justify-between border-b border-light-3/10 pb-3">
                <View className="flex-row items-center gap-2">
                  {currentLeg && getStepIcon(currentLeg.mode)}
                  <Text className="text-light-1 font-bold text-base capitalize">
                    {currentLeg?.mode.toLowerCase() === "walk"
                      ? "Jalan Kaki"
                      : `Naik ${currentLeg?.mode}`}
                  </Text>
                </View>
                <Text className="text-light-3 text-xs font-semibold">
                  Langkah {currentStepIndex + 1} / {totalSteps}
                </Text>
              </View>

              <View className="gap-1">
                <Text className="text-light-3 text-xs">Dari:</Text>
                <Text className="text-light-1 font-semibold text-sm">
                  {fromName}
                </Text>
                <Text className="text-light-3 text-xs mt-1">Menuju:</Text>
                <Text className="text-light-1 font-bold text-lg">
                  {currentLeg?.to}
                </Text>
              </View>

              <View className="flex-row items-center justify-between pt-2 gap-3">
                <Pressable
                  disabled={currentStepIndex === 0}
                  onPress={onPrev}
                  className={`flex-1 py-3 rounded-xl items-center justify-center flex-row gap-1 ${
                    currentStepIndex === 0
                      ? "bg-dark-4 opacity-40"
                      : "bg-dark-4"
                  }`}
                >
                  <Ionicons name="chevron-back" size={16} color="#FFFFFF" />
                  <Text className="text-light-1 font-semibold text-xs">
                    Sebelumnya
                  </Text>
                </Pressable>

                <Pressable
                  onPress={
                    currentStepIndex >= totalSteps - 1 ? onFinish : onNext
                  }
                  className={`flex-1 py-3 rounded-xl items-center justify-center flex-row gap-1 ${
                    currentStepIndex >= totalSteps - 1
                      ? "bg-primary-emerald"
                      : "bg-[#00875A]"
                  }`}
                >
                  <Text className="text-light-1 font-bold text-xs">
                    {currentStepIndex >= totalSteps - 1 ? "Selesai" : "Lanjut"}
                  </Text>
                  {currentStepIndex >= totalSteps - 1 ? (
                    <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                  ) : (
                    <Ionicons
                      name="chevron-forward"
                      size={16}
                      color="#FFFFFF"
                    />
                  )}
                </Pressable>
              </View>
            </>
          )}
        </>
      )}
    </View>
  );
}

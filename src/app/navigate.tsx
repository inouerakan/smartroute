import Text from "@/components/Text";
import { routeOptionItem } from "@/type";
import { Ionicons } from "@expo/vector-icons";
import {
  Camera,
  CameraRef,
  GeoJSONSource,
  Layer,
  Map,
  UserLocation,
  ViewAnnotation,
} from "@maplibre/maplibre-react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Pressable, View } from "react-native";

type Coordinate = { latitude: number; longitude: number };

// Menggunakan CartoDB Dark Matter (Gratis, Tanpa API Key)
const MAP_STYLE_URL =
  "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";

/**
 * Geocode via Nominatim
 */
async function geocodePlace(query: string): Promise<Coordinate | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query + ", Jakarta, Indonesia")}&format=json&limit=1`;
    const res = await fetch(url, {
      headers: { "User-Agent": "SmartRouteApp/1.0" },
    });
    const json = await res.json();

    if (json[0]?.lat && json[0]?.lon) {
      return {
        latitude: parseFloat(json[0].lat),
        longitude: parseFloat(json[0].lon),
      };
    }
    return null;
  } catch (err) {
    console.error(`[Geocode] Error:`, err);
    return null;
  }
}

/**
 * Fetch Polyline (Walk/Bus -> API, MRT -> Straight Line)
 */
async function fetchSegmentPolyline(
  start: Coordinate,
  end: Coordinate,
  mode: string,
): Promise<[number, number][] | null> {
  try {
    // MRT/Kereta: Garis lurus manual
    if (mode === "mrt") {
      return [
        [start.longitude, start.latitude],
        [end.longitude, end.latitude],
      ];
    }

    // Walk/Bus: Ikuti jalan raya/trotoar via OSRM
    const profile = mode === "walk" ? "foot" : "driving";
    const waypoints = `${start.longitude},${start.latitude};${end.longitude},${end.latitude}`;
    const url = `https://router.project-osrm.org/route/v1/${profile}/${waypoints}?overview=full&geometries=geojson`;

    const res = await fetch(url, {
      headers: { "User-Agent": "SmartRouteApp/1.0" },
    });
    const json = await res.json();

    if (json.code === "Ok" && json.routes?.[0]?.geometry) {
      return json.routes[0].geometry.coordinates;
    }

    // Fallback garis lurus
    return [
      [start.longitude, start.latitude],
      [end.longitude, end.latitude],
    ];
  } catch (err) {
    console.error(`[Route] Segment error:`, err);
    return null;
  }
}

export default function NavigateScreen() {
  const { data, origin } = useLocalSearchParams<{
    data: string;
    origin?: string;
  }>();
  const routeData: routeOptionItem = JSON.parse(data);
  const router = useRouter();

  const [coordinates, setCoordinates] = useState<Coordinate[]>([]);
  const [routeGeometry, setRouteGeometry] = useState<GeoJSON.LineString | null>(
    null,
  );

  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isFinished, setIsFinished] = useState(false); // State untuk menandai selesai

  const cameraRef = useRef<CameraRef>(null);

  useEffect(() => {
    const initRoute = async () => {
      setIsLoading(true);
      setHasError(false);

      try {
        const startLocation = origin ?? routeData.origin ?? "Manggarai";
        const placeNames = [
          startLocation,
          ...routeData.transitSequence.map((s) => s.destination),
        ];

        const coords: Coordinate[] = [];
        for (const name of placeNames) {
          const coord = await geocodePlace(name);
          if (coord) coords.push(coord);
          await new Promise((r) => setTimeout(r, 1100)); // Rate limit delay
        }

        if (coords.length < 2) {
          setHasError(true);
          return;
        }
        setCoordinates(coords);

        const allCoords: [number, number][] = [];

        for (let i = 0; i < routeData.transitSequence.length; i++) {
          const step = routeData.transitSequence[i];
          const startCoord = coords[i];
          const endCoord = coords[i + 1];

          if (startCoord && endCoord) {
            const segmentCoords = await fetchSegmentPolyline(
              startCoord,
              endCoord,
              step.mode,
            );
            if (segmentCoords && segmentCoords.length > 0) {
              allCoords.push(...segmentCoords);
            }
          }
        }

        if (allCoords.length > 0) {
          setRouteGeometry({ type: "LineString", coordinates: allCoords });
        }
      } catch (err) {
        console.error("[Route] Fatal error:", err);
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    };

    initRoute();
  }, []);

  // ─── Camera Animation ───
  useEffect(() => {
    if (coordinates.length > 0 && cameraRef.current) {
      // Jika selesai, fokus ke tujuan akhir (koordinat terakhir)
      // Jika belum, fokus ke titik awal step saat ini
      const targetIndex = isFinished
        ? coordinates.length - 1
        : currentStepIndex;
      const targetCoord = coordinates[targetIndex];

      if (targetCoord) {
        cameraRef.current.flyTo({
          center: [targetCoord.longitude, targetCoord.latitude],
          zoom: 15,
          duration: 800,
        });
      }
    }
  }, [currentStepIndex, coordinates, isFinished]);

  if (isLoading) {
    return (
      <View className="flex-1 bg-[#18181B] items-center justify-center gap-3">
        <ActivityIndicator size="large" color="#00875A" />
        <Text className="text-light-2 text-sm">Memuat rute perjalanan...</Text>
      </View>
    );
  }

  if (hasError || coordinates.length < 2) {
    return (
      <View className="flex-1 bg-[#18181B] items-center justify-center gap-3 px-8">
        <Ionicons name="warning-outline" size={40} color="#EF4444" />
        <Text className="text-light-1 text-center font-bold">
          Gagal memuat rute
        </Text>
        <Pressable
          onPress={() => router.back()}
          className="bg-light-1 px-5 py-2.5 rounded-xl mt-2"
        >
          <Text className="text-dark-1 font-bold">Kembali</Text>
        </Pressable>
      </View>
    );
  }

  const totalSteps = routeData.transitSequence.length;

  // --- LOGIKA PROGRESS BAR ---
  // Jika selesai = 100%
  // Jika belum = (stepSekarang / totalStep) * 100
  // Step 0 -> 0%, Step 1 (dari 3) -> 33%, dst.
  const progressPercentage = isFinished
    ? 100
    : Math.round((currentStepIndex / totalSteps) * 100);

  // Ambil data step saat ini (jika belum selesai)
  const currentStep = isFinished
    ? null
    : routeData.transitSequence[currentStepIndex];

  const fromName =
    currentStepIndex === 0
      ? "Lokasi Anda"
      : (routeData.transitSequence[currentStepIndex - 1]?.destination ?? "");

  const getStepIcon = (mode: string) => {
    switch (mode) {
      case "walk":
        return <Ionicons name="walk" size={24} color="#00875A" />;
      case "transjakarta":
      case "jaklingko":
        return <Ionicons name="bus" size={24} color="#3B82F6" />;
      case "mrt":
        return <Ionicons name="train" size={24} color="#EAB308" />;
      default:
        return <Ionicons name="navigate-outline" size={24} color="#FFFFFF" />;
    }
  };

  // Handler untuk tombol Selesai/Lanjut
  const handleNextStep = () => {
    if (currentStepIndex >= totalSteps - 1) {
      // Jika di langkah terakhir, tandai selesai
      setIsFinished(true);
    } else {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  return (
    <View className="flex-1 bg-[#18181B]">
      <Map style={{ flex: 1 }} mapStyle={MAP_STYLE_URL}>
        <UserLocation />
        <Camera
          ref={cameraRef}
          initialViewState={{
            center: [coordinates[0].longitude, coordinates[0].latitude],
            zoom: 14,
          }}
        />

        {/* Garis Rute Tunggal */}
        {routeGeometry && (
          <GeoJSONSource
            id="routeSource"
            data={{ type: "Feature", geometry: routeGeometry, properties: {} }}
          >
            <Layer
              type="line"
              id="routeLine"
              style={{
                lineColor: "#00875A",
                lineWidth: 5,
                lineCap: "round",
                lineJoin: "round",
              }}
            />
          </GeoJSONSource>
        )}

        {/* Marker Titik Transit */}
        {coordinates.map((coord, index) => {
          // Aktif jika:
          // 1. Belum selesai DAN index sama dengan step sekarang
          // 2. Sudah selesai DAN index adalah titik terakhir
          const isActive = isFinished
            ? index === coordinates.length - 1
            : index === currentStepIndex;

          const isOrigin = index === 0;

          return (
            <ViewAnnotation
              key={`marker-${index}`}
              id={`marker-${index}`}
              lngLat={[coord.longitude, coord.latitude]}
            >
              <View
                className="rounded-full items-center justify-center border-white"
                style={{
                  width: isActive ? 24 : 16,
                  height: isActive ? 24 : 16,
                  backgroundColor: isOrigin
                    ? "#EF4444"
                    : isActive
                      ? "#00875A"
                      : "#6B7280",
                  borderWidth: isActive ? 2 : 1,
                  opacity: isActive || isOrigin ? 1 : 0.7,
                }}
              />
            </ViewAnnotation>
          );
        })}
      </Map>

      {/* Tombol Kembali */}
      <Pressable
        onPress={() => router.back()}
        className="absolute top-14 left-5 bg-dark-2 p-3 rounded-full shadow-md z-10"
      >
        <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
      </Pressable>

      {/* Step Navigation Card */}
      <View className="absolute bottom-8 left-5 right-5 bg-dark-2 p-5 rounded-2xl gap-4 shadow-2xl border border-light-3/10">
        {/* --- PROGRESS BAR UI --- */}
        <View className="w-full gap-2">
          <View className="flex-row justify-between items-center">
            <Text className="text-light-3 text-xs font-semibold">
              {isFinished ? "Perjalanan Selesai" : "Progres Perjalanan"}
            </Text>
            <Text
              className={`${isFinished ? "text-primary-emerald" : "text-light-1"} text-xs font-bold`}
            >
              {progressPercentage}%
            </Text>
          </View>
          <View className="w-full h-1.5 bg-dark-4 rounded-full overflow-hidden">
            <View
              className={`h-full rounded-full ${isFinished ? "bg-primary-emerald" : "bg-light-1"}`}
              style={{ width: `${progressPercentage}%` }}
            />
          </View>
        </View>
        {/* ------------------------ */}

        {isFinished ? (
          // --- TAMPILAN JIKA SELESAI ---
          <View className="items-center gap-3 py-2">
            <View className="w-16 h-16 bg-primary-emerald/20 rounded-full items-center justify-center">
              <Ionicons name="checkmark-circle" size={40} color="#00875A" />
            </View>
            <Text className="text-light-1 font-bold text-xl text-center">
              Sampai Tujuan!
            </Text>
            <Text className="text-light-3 text-sm text-center">
              Anda telah tiba di{" "}
              {routeData.transitSequence[totalSteps - 1].destination}
            </Text>
            <Pressable
              onPress={() => router.back()} // Atau router.replace('/')
              className="w-full py-3 rounded-xl items-center justify-center bg-light-1 mt-2"
            >
              <Text className="text-dark-1 font-bold">Kembali ke Beranda</Text>
            </Pressable>
          </View>
        ) : (
          // --- TAMPILAN NAVIGASI BIASA ---
          <>
            <View className="flex-row items-center justify-between border-b border-light-3/10 pb-3">
              <View className="flex-row items-center gap-2">
                {currentStep && getStepIcon(currentStep.mode)}
                <Text className="text-light-1 font-bold text-base capitalize">
                  {currentStep?.mode === "walk"
                    ? "Jalan Kaki"
                    : `Naik ${currentStep?.mode}`}
                </Text>
              </View>
              <Text className="text-light-3 text-xs font-semibold">
                Langkah {currentStepIndex + 1} dari {totalSteps}
              </Text>
            </View>

            <View className="gap-1">
              <Text className="text-light-3 text-xs">Dari:</Text>
              <Text className="text-light-1 font-semibold text-sm">
                {fromName}
              </Text>
              <Text className="text-light-3 text-xs mt-1">Menuju:</Text>
              <Text className="text-light-1 font-bold text-lg">
                {currentStep?.destination}
              </Text>
            </View>

            <View className="flex-row items-center justify-between pt-2 gap-3">
              <Pressable
                disabled={currentStepIndex === 0}
                onPress={() => setCurrentStepIndex((prev) => prev - 1)}
                className={`flex-1 py-3 rounded-xl items-center justify-center flex-row gap-1 ${currentStepIndex === 0 ? "bg-dark-4 opacity-40" : "bg-dark-4"}`}
              >
                <Ionicons name="chevron-back" size={16} color="#FFFFFF" />
                <Text className="text-light-1 font-semibold text-xs">
                  Sebelumnya
                </Text>
              </Pressable>

              <Pressable
                onPress={handleNextStep}
                className={`flex-1 py-3 rounded-xl items-center justify-center flex-row gap-1 ${
                  currentStepIndex >= totalSteps - 1
                    ? "bg-primary-emerald" // Warna beda untuk tombol finish
                    : "bg-[#00875A]"
                }`}
              >
                <Text className="text-light-1 font-bold text-xs">
                  {currentStepIndex >= totalSteps - 1
                    ? "Selesai"
                    : "Lanjut Step"}
                </Text>
                {currentStepIndex >= totalSteps - 1 ? (
                  <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                ) : (
                  <Ionicons name="chevron-forward" size={16} color="#FFFFFF" />
                )}
              </Pressable>
            </View>
          </>
        )}
      </View>
    </View>
  );
}

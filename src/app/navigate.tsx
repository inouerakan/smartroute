// src/app/navigate.tsx (VERSI NORMAL - PRODUKSI)
import StepCard from "@/components/navigate/StepCard";
import Text from "@/components/Text";
import { RouteItem } from "@/type"; // Pastikan pakai type terbaru
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
import * as Location from "expo-location";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Pressable, View } from "react-native";

type Coordinate = { latitude: number; longitude: number };

const MAP_STYLE_URL =
  "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";

// --- API Helpers ---
async function geocodePlace(query: string): Promise<Coordinate | null> {
  try {
    // Gunakan Indonesia saja agar fleksibel (Bandung/Jakarta/dll)
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query + ", Indonesia")}&format=json&limit=1`;
    const res = await fetch(url, {
      headers: { "User-Agent": "SmartRouteApp/1.0" },
    });
    const json = await res.json();
    if (json[0]?.lat && json[0]?.lon)
      return {
        latitude: parseFloat(json[0].lat),
        longitude: parseFloat(json[0].lon),
      };
    return null;
  } catch (err) {
    return null;
  }
}

async function fetchSegmentPolyline(
  start: Coordinate,
  end: Coordinate,
  mode: string,
): Promise<[number, number][] | null> {
  try {
    const m = mode.toLowerCase();
    if (["mrt", "krl", "train"].includes(m))
      return [
        [start.longitude, start.latitude],
        [end.longitude, end.latitude],
      ];

    const profile = m === "walk" ? "foot" : "driving";
    const waypoints = `${start.longitude},${start.latitude};${end.longitude},${end.latitude}`;
    const url = `https://router.project-osrm.org/route/v1/${profile}/${waypoints}?overview=full&geometries=geojson`;
    const res = await fetch(url, {
      headers: { "User-Agent": "SmartRouteApp/1.0" },
    });
    const json = await res.json();
    if (json.code === "Ok" && json.routes?.[0]?.geometry)
      return json.routes[0].geometry.coordinates;
    return [
      [start.longitude, start.latitude],
      [end.longitude, end.latitude],
    ];
  } catch (err) {
    return null;
  }
}

function findClosestPointIndex(
  userCoord: Coordinate,
  polylineCoords: [number, number][],
): number {
  let minDistance = Infinity;
  let closestIndex = 0;
  polylineCoords.forEach((point, index) => {
    const latDiff = point[1] - userCoord.latitude;
    const lngDiff = point[0] - userCoord.longitude;
    const distance = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff);
    if (distance < minDistance) {
      minDistance = distance;
      closestIndex = index;
    }
  });
  return closestIndex;
}

export default function NavigateScreen() {
  const { data, origin } = useLocalSearchParams<{
    data: string;
    origin?: string;
  }>();
  const routeData: RouteItem = JSON.parse(data);
  const router = useRouter();

  const [coordinates, setCoordinates] = useState<Coordinate[]>([]);
  const [routeGeometry, setRouteGeometry] = useState<GeoJSON.LineString | null>(
    null,
  );
  const [fullRouteCoords, setFullRouteCoords] = useState<[number, number][]>(
    [],
  );

  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const [isFollowingUser, setIsFollowingUser] = useState(true);
  const [userLocation, setUserLocation] = useState<Coordinate | null>(null);

  const cameraRef = useRef<CameraRef>(null);
  const locationSubscription = useRef<Location.LocationSubscription | null>(
    null,
  );

  // --- 1. SETUP LOCATION (REAL GPS) ---
  useEffect(() => {
    let mounted = true;
    const startTracking = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;

      const current = await Location.getCurrentPositionAsync({});
      if (mounted)
        setUserLocation({
          latitude: current.coords.latitude,
          longitude: current.coords.longitude,
        });

      locationSubscription.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000,
          distanceInterval: 10,
        },
        (newLocation) => {
          if (mounted)
            setUserLocation({
              latitude: newLocation.coords.latitude,
              longitude: newLocation.coords.longitude,
            });
        },
      );
    };
    startTracking();
    return () => {
      mounted = false;
      locationSubscription.current?.remove();
    };
  }, []);

  // --- 2. INIT ROUTE ---
  useEffect(() => {
    const initRoute = async () => {
      setIsLoading(true);
      try {
        const pointsToGeocode: string[] = [];
        if (routeData.legs.length > 0)
          pointsToGeocode.push(routeData.legs[0].from);
        routeData.legs.forEach((leg) => pointsToGeocode.push(leg.to));

        const coords: Coordinate[] = [];
        for (const name of pointsToGeocode) {
          const coord = await geocodePlace(name);
          if (coord) coords.push(coord);
          await new Promise((r) => setTimeout(r, 1100));
        }

        if (coords.length < 2) {
          setHasError(true);
          return;
        }
        setCoordinates(coords);

        const allCoords: [number, number][] = [];
        for (let i = 0; i < routeData.legs.length; i++) {
          const leg = routeData.legs[i];
          const startCoord = coords[i];
          const endCoord = coords[i + 1];
          if (startCoord && endCoord) {
            const segment = await fetchSegmentPolyline(
              startCoord,
              endCoord,
              leg.mode,
            );
            if (segment) allCoords.push(...segment);
          }
        }
        if (allCoords.length > 0) {
          setFullRouteCoords(allCoords);
          setRouteGeometry({ type: "LineString", coordinates: allCoords });
        }
      } catch (err) {
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    };
    initRoute();
  }, []);

  // --- 3. LOGIKA TRIMMING ROUTE (JALAN OTOMATIS) ---
  useEffect(() => {
    if (!userLocation || fullRouteCoords.length === 0 || isFinished) return;

    const closestIndex = findClosestPointIndex(userLocation, fullRouteCoords);
    const startIndex = Math.max(0, closestIndex - 2); // Sisakan sedikit di belakang
    const trimmedCoords = fullRouteCoords.slice(startIndex);

    if (
      trimmedCoords.length > 0 &&
      trimmedCoords.length < fullRouteCoords.length
    ) {
      setRouteGeometry({ type: "LineString", coordinates: trimmedCoords });
    }
  }, [userLocation, fullRouteCoords, isFinished]);

  // --- 4. CAMERA LOGIC ---
  useEffect(() => {
    if (!cameraRef.current) return;
    if (isFollowingUser && userLocation) {
      cameraRef.current.flyTo({
        center: [userLocation.longitude, userLocation.latitude],
        zoom: 16,
        duration: 1000,
      });
      return;
    }
    if (coordinates.length > 0) {
      const targetIndex = isFinished
        ? coordinates.length - 1
        : currentStepIndex;
      const targetCoord = coordinates[targetIndex];
      if (targetCoord)
        cameraRef.current.flyTo({
          center: [targetCoord.longitude, targetCoord.latitude],
          zoom: 15,
          duration: 800,
        });
    }
  }, [
    currentStepIndex,
    coordinates,
    isFinished,
    isFollowingUser,
    userLocation,
  ]);

  const handleNext = () => {
    setIsFollowingUser(false);
    if (currentStepIndex >= routeData.legs.length - 1) setIsFinished(true);
    else setCurrentStepIndex((p) => p + 1);
  };
  const handlePrev = () => {
    setIsFollowingUser(false);
    setCurrentStepIndex((p) => p - 1);
  };

  if (isLoading)
    return (
      <View className="flex-1 bg-[#18181B] items-center justify-center gap-3">
        <ActivityIndicator size="large" color="#00875A" />
        <Text className="text-light-2 text-sm">Memuat rute...</Text>
      </View>
    );
  if (hasError || coordinates.length < 2)
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

  const totalSteps = routeData.legs.length;
  const progressPercentage = isFinished
    ? 100
    : Math.round((currentStepIndex / totalSteps) * 100);
  const currentLeg = isFinished ? null : routeData.legs[currentStepIndex];
  const fromName =
    currentStepIndex === 0
      ? (origin ?? routeData.legs[0]?.from ?? "Lokasi Anda")
      : (routeData.legs[currentStepIndex - 1]?.to ?? "");

  return (
    <View className="flex-1 bg-[#18181B]">
      <Map style={{ flex: 1 }} mapStyle={MAP_STYLE_URL}>
        <UserLocation />
        <Camera
          ref={cameraRef}
          initialViewState={{
            center: userLocation
              ? [userLocation.longitude, userLocation.latitude]
              : [coordinates[0].longitude, coordinates[0].latitude],
            zoom: 15,
          }}
        />

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

        {coordinates.map((coord, index) => {
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

      <View className="absolute top-14 left-5 right-5 flex-row justify-between items-start z-10">
        {!isFinished && (
          <Pressable
            onPress={() => router.back()}
            className="bg-dark-2 p-3 rounded-full shadow-md"
          >
            <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
          </Pressable>
        )}
        {!isFinished && (
          <Pressable
            onPress={() => setIsFollowingUser(!isFollowingUser)}
            className={`p-3 rounded-full shadow-lg border ${isFollowingUser ? "bg-primary-emerald border-primary-emerald" : "bg-dark-2 border-light-3/20"}`}
          >
            <Ionicons
              name={isFollowingUser ? "locate" : "locate-outline"}
              size={24}
              color={isFollowingUser ? "#FFFFFF" : "#A1A1AA"}
            />
          </Pressable>
        )}
      </View>

      <StepCard
        currentLeg={currentLeg}
        totalSteps={totalSteps}
        currentStepIndex={currentStepIndex}
        isFinished={isFinished}
        fromName={fromName}
        progressPercentage={progressPercentage}
        routeData={routeData}
        onNext={handleNext}
        onPrev={handlePrev}
        onFinish={() => {
          setIsFollowingUser(false);
          setIsFinished(true);
        }}
        onBack={() => router.back()}
      />
    </View>
  );
}

// src/components/navigate/NavigateMap.tsx
import { Coordinate } from "@/services/mapService";
import {
    Camera,
    CameraRef,
    GeoJSONSource,
    Layer,
    Map,
    UserLocation,
    ViewAnnotation,
} from "@maplibre/maplibre-react-native";
import { forwardRef, useEffect } from "react";
import { View } from "react-native";

const MAP_STYLE_URL =
  "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";

interface NavigateMapProps {
  coordinates: Coordinate[];
  routeGeometry: GeoJSON.LineString | null;
  currentStepIndex: number;
  isFinished: boolean;
}

// Menggunakan forwardRef agar parent bisa akses cameraRef jika perlu,
// atau kita handle camera logic di dalam sini saja.
// Untuk simplifikasi, kita handle camera logic di dalam komponen ini.
const NavigateMap = forwardRef<CameraRef, NavigateMapProps>(
  ({ coordinates, routeGeometry, currentStepIndex, isFinished }, ref) => {
    // Camera Animation Logic
    useEffect(() => {
      if (
        coordinates.length > 0 &&
        ref &&
        typeof ref !== "function" &&
        ref.current
      ) {
        const targetIndex = isFinished
          ? coordinates.length - 1
          : currentStepIndex;
        const targetCoord = coordinates[targetIndex];

        if (targetCoord) {
          ref.current.flyTo({
            center: [targetCoord.longitude, targetCoord.latitude],
            zoom: 15,
            duration: 800,
          });
        }
      }
    }, [currentStepIndex, coordinates, isFinished, ref]);

    if (coordinates.length === 0) return null;

    return (
      <Map style={{ flex: 1 }} mapStyle={MAP_STYLE_URL}>
        <UserLocation />
        <Camera
          ref={ref}
          initialViewState={{
            center: [coordinates[0].longitude, coordinates[0].latitude],
            zoom: 14,
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
    );
  },
);

export default NavigateMap;

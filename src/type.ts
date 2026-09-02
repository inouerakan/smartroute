// src/type/index.ts

export interface Leg {
  mode: "KRL" | "MRT" | "TransJakarta" | "JakLingko" | "Walk" | string;
  service?: string;
  from: string;
  to: string;
}

export interface CrowdInfo {
  current_level: "LOW" | "MEDIUM" | "HIGH";
  predicted_level: "LOW" | "MEDIUM" | "HIGH";
  predicted_occupancy: number; // 0-100
}

export interface ReliabilityInfo {
  score: number;
  delay_risk: number;
}

export interface RouteItem {
  route_id: string;
  rank: number;
  legs: Leg[];
  travel_time_minutes: number;
  cost_idr: number;
  transfers: number;
  walking_distance_m: number;
  crowd: CrowdInfo;
  reliability: ReliabilityInfo;
  comfort_score: number;
  recommendation_score: number;
  reason?: string[]; // Alasan rekomendasi
}

export interface ApiResponse {
  request_id: string;
  timestamp: string;
  origin: { name: string; lat: number; lng: number };
  destination: { name: string; lat: number; lng: number };
  routes: RouteItem[];
  recommendation?: {
    route_id: string;
    rank: number;
    score: number;
    reason: string[];
  };
}

// Alias untuk kompatibilitas dengan kode lama jika perlu
export type routeOptionItem = RouteItem;

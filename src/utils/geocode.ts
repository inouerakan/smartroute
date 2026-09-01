// src/utils/geocode.ts

type Coordinate = {
  latitude: number;
  longitude: number;
};

// Cache sederhana di memory, biar nama tempat yang sama
// tidak fetch berulang kali (mengurangi beban ke Nominatim)
const geocodeCache = new Map<string, Coordinate>();

// Antrian sederhana untuk memastikan request Nominatim
// tidak lebih dari 1x per detik (sesuai kebijakan mereka)
let lastRequestTime = 0;
const MIN_INTERVAL_MS = 1100; // sedikit di atas 1 detik untuk jaga-jaga

async function throttle() {
  const now = Date.now();
  const elapsed = now - lastRequestTime;
  if (elapsed < MIN_INTERVAL_MS) {
    await new Promise((resolve) =>
      setTimeout(resolve, MIN_INTERVAL_MS - elapsed),
    );
  }
  lastRequestTime = Date.now();
}

/**
 * Geocode satu nama tempat menjadi koordinat lat/lng
 * menggunakan Nominatim (OpenStreetMap), gratis tanpa API key.
 *
 * @param placeName - nama tempat, contoh: "Stasiun Manggarai, Jakarta"
 * @param fallback - koordinat default kalau geocoding gagal (opsional)
 */
export async function geocodePlace(
  placeName: string,
  fallback?: Coordinate,
): Promise<Coordinate | null> {
  // Cek cache dulu
  if (geocodeCache.has(placeName)) {
    return geocodeCache.get(placeName)!;
  }

  try {
    await throttle();

    // Tambahkan konteks "Jakarta, Indonesia" biar hasil lebih akurat
    // untuk nama-nama halte/stasiun yang bisa ambigu
    const query = encodeURIComponent(`${placeName}, Jakarta, Indonesia`);
    const url = `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`;

    const response = await fetch(url, {
      headers: {
        // WAJIB diisi sesuai kebijakan Nominatim — ganti dengan nama app kamu
        "User-Agent": "SmartRouteAI/1.0 (contact: yourgithub-or-email)",
      },
    });

    if (!response.ok) {
      throw new Error(`Geocoding gagal: ${response.status}`);
    }

    const results = await response.json();

    if (results.length === 0) {
      console.warn(`Nominatim: tidak ditemukan hasil untuk "${placeName}"`);
      return fallback ?? null;
    }

    const coordinate: Coordinate = {
      latitude: parseFloat(results[0].lat),
      longitude: parseFloat(results[0].lon),
    };

    geocodeCache.set(placeName, coordinate);
    return coordinate;
  } catch (error) {
    console.error(`Error geocoding "${placeName}":`, error);
    return fallback ?? null;
  }
}

/**
 * Geocode banyak nama tempat sekaligus secara berurutan
 * (bukan paralel, karena Nominatim membatasi 1 request/detik).
 *
 * @param placeNames - array nama tempat
 */
export async function geocodeMultiplePlaces(
  placeNames: string[],
): Promise<(Coordinate | null)[]> {
  const results: (Coordinate | null)[] = [];

  for (const name of placeNames) {
    const coord = await geocodePlace(name);
    results.push(coord);
  }

  return results;
}

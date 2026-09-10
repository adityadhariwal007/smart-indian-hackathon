/**
 * Routing & Navigation Service
 * Calculates road routes, distances, headings, and dynamic ETAs
 * using OpenStreetMap OSRM API with an offline fallback.
 */

// Haversine formula to compute great-circle distance in kilometers
export function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 100) / 100; // 2 decimal places
}

// Calculate bearing/heading angle in degrees (0 = North, 90 = East, 180 = South, 270 = West)
export function calculateBearing(lat1, lon1, lat2, lon2) {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const toDeg = (rad) => (rad * 180) / Math.PI;

  const y = Math.sin(toRad(lon2 - lon1)) * Math.cos(toRad(lat2));
  const x =
    Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
    Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(toRad(lon2 - lon1));

  let brng = toDeg(Math.atan2(y, x));
  return Math.round((brng + 360) % 360);
}

// Generate realistic intermediate waypoints if OSRM is offline
function generateFallbackWaypoints(start, dest, numPoints = 25) {
  const points = [];
  for (let i = 0; i <= numPoints; i++) {
    const t = i / numPoints;
    // Base linear interpolation
    let lat = start.lat + (dest.lat - start.lat) * t;
    let lng = start.lng + (dest.lng - start.lng) * t;

    // Add subtle curvature to simulate road navigation rather than bird flight
    if (i > 0 && i < numPoints) {
      const curve = Math.sin(t * Math.PI) * 0.0025;
      lat += curve * 0.4;
      lng -= curve * 0.5;
    }
    points.push([Number(lat.toFixed(6)), Number(lng.toFixed(6))]);
  }
  return points;
}

/**
 * Fetch realistic road route between start and destination
 * @param {{lat: number, lng: number}} start 
 * @param {{lat: number, lng: number}} dest 
 * @returns {Promise<{waypoints: Array<[number, number]>, distanceKm: number, etaMinutes: number}>}
 */
export async function getRoadRoute(start, dest) {
  const straightDistKm = calculateDistanceKm(start.lat, start.lng, dest.lat, dest.lng);

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const url = `https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${dest.lng},${dest.lat}?overview=full&geometries=geojson`;
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        // OSRM returns coordinates as [lng, lat], convert to Leaflet standard [lat, lng]
        const waypoints = route.geometry.coordinates.map(([lng, lat]) => [
          Number(lat.toFixed(6)),
          Number(lng.toFixed(6)),
        ]);
        const distanceKm = Math.round((route.distance / 1000) * 100) / 100;
        const etaMinutes = Math.max(1, Math.round(route.duration / 60));

        return {
          waypoints,
          distanceKm,
          etaMinutes,
          source: 'osrm_road_network',
        };
      }
    }
  } catch (err) {
    console.warn('[RoutingService] OSRM service not reachable or timed out. Falling back to synthetic road interpolation.');
  }

  // Fallback if network or OSRM unavailable
  const fallbackWaypoints = generateFallbackWaypoints(start, dest, 30);
  const roadFactor = 1.25; // Driving distance is typically ~25% longer than straight-line
  const distanceKm = Math.round(straightDistKm * roadFactor * 100) / 100;
  // Emergency speed estimate: ~40 km/h in urban corridors
  const etaMinutes = Math.max(1, Math.round((distanceKm / 40) * 60));

  return {
    waypoints: fallbackWaypoints,
    distanceKm,
    etaMinutes,
    source: 'interpolated_road_corridor',
  };
}

/**
 * Compute dynamic remaining distance and updated ETA based on current coordinates
 */
export function calculateRemainingEtaAndDistance(currentPos, destinationPos, speedKmh = 45) {
  const remainingDist = calculateDistanceKm(
    currentPos.lat,
    currentPos.lng,
    destinationPos.lat,
    destinationPos.lng
  );

  const effectiveSpeed = Math.max(20, Math.min(speedKmh || 40, 90));
  // In urban areas, add 1.2 factor for turns and intersection slowing
  const urbanDist = remainingDist * 1.2;
  const etaMinutes = Math.max(1, Math.round((urbanDist / effectiveSpeed) * 60));

  return {
    distanceRemainingKm: Math.round(remainingDist * 100) / 100,
    etaMinutes,
  };
}

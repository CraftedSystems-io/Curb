export function milesToMeters(miles: number): number {
  return miles * 1609.34;
}

export function metersToMiles(meters: number): number {
  return meters / 1609.34;
}

export function getBoundsForRadius(
  lat: number,
  lng: number,
  radiusKm: number
) {
  const latDelta = radiusKm / 111.32;
  const lngDelta = radiusKm / (111.32 * Math.cos((lat * Math.PI) / 180));

  return {
    north: lat + latDelta,
    south: lat - latDelta,
    east: lng + lngDelta,
    west: lng - lngDelta,
  };
}

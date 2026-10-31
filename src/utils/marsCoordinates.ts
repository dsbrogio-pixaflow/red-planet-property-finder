/** East-positive longitude; +Y north; longitude 0 faces +X. */
export function marsPosition(latitude: number, longitude: number, radius = 1): [number, number, number] {
  const lat = latitude * Math.PI / 180;
  const lon = longitude * Math.PI / 180;
  return [radius * Math.cos(lat) * Math.cos(lon), radius * Math.sin(lat), -radius * Math.cos(lat) * Math.sin(lon)];
}
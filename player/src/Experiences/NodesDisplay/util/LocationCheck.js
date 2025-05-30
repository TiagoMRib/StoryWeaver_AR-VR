import { useEffect, useState } from "react";

export function useLocationCheck(targetCoords, tolerance, setIsOnLocation) {
  const [distance, setDistance] = useState(null);

  useEffect(() => {
    if (!targetCoords) return;

    const interval = setInterval(() => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const currentCoords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };

          const distanceMeters = getDistanceBetweenCoords(
            currentCoords.lat,
            currentCoords.lng,
            targetCoords.lat,
            targetCoords.lng
          );

          setDistance(distanceMeters);
          setIsOnLocation(distanceMeters < tolerance);
        },
        (error) => console.error("Error getting location:", error),
        { enableHighAccuracy: true }
      );
    }, 3000);

    return () => clearInterval(interval);
  }, [targetCoords]);

  return distance;
}

function degreesToRadians(degrees) {
  return (degrees * Math.PI) / 180;
}

export function getDistanceBetweenCoords(lat1, lon1, lat2, lon2) {
  const earthRadiusKm = 6371;

  const dLat = degreesToRadians(lat2 - lat1);
  const dLon = degreesToRadians(lon2 - lon1);
  lat1 = degreesToRadians(lat1);
  lat2 = degreesToRadians(lat2);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLon / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadiusKm * c * 1000; // meters
}

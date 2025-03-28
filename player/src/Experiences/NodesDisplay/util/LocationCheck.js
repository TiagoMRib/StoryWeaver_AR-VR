import { useEffect, useState } from "react";
import { ApiDataRepository } from "../../../api/ApiDataRepository";

export function useLocationCheck(map, place, tolerance, setIsOnLocation) {
  const repo = ApiDataRepository.getInstance();
  const [distance, setDistance] = useState(null);

  useEffect(() => {
    if (!map || !place) return;

    repo
      .getMapPlaceCoords(map, place)
      .then((coords) => {
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
                coords.lat,
                coords.lng
              );

              setDistance(distanceMeters);
              setIsOnLocation(distanceMeters < tolerance);
            },
            (error) => console.error("Error getting location:", error),
            { enableHighAccuracy: true }
          );
        }, 3000);

        return () => clearInterval(interval);
      })
      .catch((error) => console.error("Error getting map coords:", error));
  }, [map, place]);

  return distance;
}

function degreesToRadians(degrees) {
  return (degrees * Math.PI) / 180;
}

export function getDistanceBetweenCoords(lat1, lon1, lat2, lon2) {
  var earthRadiusKm = 6371;

  console.log("Coords 1: ", lat1, lon1);
  console.log("Coords 2: ", lat2, lon2);
  var dLat = degreesToRadians(lat2 - lat1);
  var dLon = degreesToRadians(lon2 - lon1);

  lat1 = degreesToRadians(lat1);
  lat2 = degreesToRadians(lat2);

  var a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  console.log("Distance: ", (earthRadiusKm * c) * 1000);
  return (earthRadiusKm * c) * 1000; //return in meters
}

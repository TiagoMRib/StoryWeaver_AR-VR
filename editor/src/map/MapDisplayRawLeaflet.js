import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import { Typography } from "@mui/material";
import { iconAnchor, MarkerTypeToIcon } from "./MarkerIcon";
import { createRoot } from "react-dom/client";
import { flushSync } from "react-dom";
import PopupAnchor from "./PopupAnchor";
import { MarkerTypes } from "../models/MarkerTypes";
import PopupMarker from "./PopupMarker";
import { ApiDataRepository } from "../api/ApiDataRepository";
import { distanceInKmBetweenEarthCoordinates } from "./util";

export default function MapDisplayRawLeaflet(props) {
  const repo = ApiDataRepository.getInstance();

  const zoom = props.zoom;
  const center = props.center;
  const mapInfo = props.map;
  const setAlertText = props.setAlertText;
  const setAlertDisplay = props.setAlertDisplay;

  const maps = props.maps;
  const setMaps = props.setMapsState;
  const width = mapInfo.mapSize.width;
  const height = mapInfo.mapSize.height;
  const wh = [height, width];
  console.log(wh);
  const origin = [0, 0];
  const bounds = [origin, wh];
  const mapContainer = useRef();

  const anchors = mapInfo.anchors;
  const locations = props.locations;

  const addMarker = (latlng, map, anchorId, anchorType) => {
    console.log("Adding Marker")
    const anchor = L.marker(latlng, {
      icon: MarkerTypeToIcon[anchorType] || iconAnchor,
      draggable: true,
    }).addTo(map);

    anchor.bindPopup(() => {
      const div = document.createElement("div");
      const root = createRoot(div);
      flushSync(() => {
        if (anchorType == MarkerTypes.anchor) {
          root.render(
            <>
            <Typography variant="h6" sx={{ color: "black", textAlign: "center" }}>
              {mapInfo.anchors.find(anchor => anchor.anchorId == anchorId)?.name || "Sem nome"}
            </Typography>
            <PopupAnchor
              anchorId={anchorId}
              mapInfo={mapInfo}
              maps={maps}
              setMaps={setMaps}
              marker={anchor}
              setAlertDisplay={setAlertDisplay}
              setAlertText={setAlertText}
            />
            </>
          );
        } else {
          root.render(
            <PopupMarker
              anchorId={anchorId}
              mapInfo={mapInfo}
              maps={maps}
              setMaps={setMaps}
              marker={anchor}
              setAlertDisplay={setAlertDisplay}
              setAlertText={setAlertText}
            />
          );
        }
      });
      return div.innerHTML;
    });
    anchor.on("dragend", (e) => {
      const anchors = mapInfo.anchors.filter(
        (anchor) => anchor.anchorType === "anchor"
      );
      const newAnchors = mapInfo.anchors.map((anchor) => {
        if (anchor.anchorId == anchorId) {
          anchor.imgCoords = e.target.getLatLng();

          //recalculate realCoords using mapInfo.scale
          if (anchorType == MarkerTypes.anchor) {
            anchor.coords = {
              lat: 0,
              lng: 0,
            };
          } else {
            const dx =
              (anchor.imgCoords.lng - anchors[0].imgCoords.lng) * mapInfo.scale; // x distance from anchor in meters
            const dy =
              (anchor.imgCoords.lat - anchors[0].imgCoords.lat) * mapInfo.scale; // y distance from anchor in meters
            
            console.log("dx: ", dx, "dy: ", dy);
            const r_earth = 6371e3; // meters
            anchor.coords = {
              lat: anchors[0].coords.lat + (dy / r_earth) * (180 / Math.PI),
              lng:
                anchors[0].coords.lng +
                ((dx / r_earth) * (180 / Math.PI)) /
                  Math.cos((anchors[0].coords.lat * Math.PI) / 180),
            };
            console.log("anchor coords: ", anchor.coords);
          }
        }
        return anchor;
      });
      const newMaps = maps.filter((map) => map.id != mapInfo.id);
      mapInfo.anchors = newAnchors;
      newMaps.push(mapInfo);
      setMaps(newMaps);
      localStorage.setItem("maps", JSON.stringify(newMaps));
    });
    return anchor;
  };

  useEffect(() => {
    const map = L.map(mapContainer.current, {
      crs: L.CRS.Simple,
      attributionControl: false,
      minZoom: -3,
    });

    anchors.forEach((anchor) => {
      addMarker(anchor.imgCoords, map, anchor.anchorId, anchor.anchorType);
    });

    map.on("click", (e) => {
      if (mapInfo.progressionState !== "not-started") return;
    
      const anchorId = mapInfo.anchors.length + 1;
      let newCoords = { lat: 0, lng: 0 }; // Default to (0,0) for first two anchors
    
      if (mapInfo.anchors.length >= 1) {
        // If at least one anchor exists, use it as reference
        const referenceAnchor = mapInfo.anchors[0];
    
        // Convert image coordinates to real-world coordinates
        const dx = (e.latlng.lng - referenceAnchor.imgCoords.lng) * mapInfo.scale;
        const dy = (e.latlng.lat - referenceAnchor.imgCoords.lat) * mapInfo.scale;
    
        newCoords = {
          lat: referenceAnchor.coords.lat + (dy / 6371e3) * (180 / Math.PI),
          lng: referenceAnchor.coords.lng +
            ((dx / 6371e3) * (180 / Math.PI)) / Math.cos(referenceAnchor.coords.lat * Math.PI / 180),
        };
      }
    
      mapInfo.anchors.push({
        anchorId: anchorId,
        anchorType: MarkerTypes.anchor,
        coords: newCoords, // Now correctly set based on existing anchors
        imgCoords: e.latlng,
      });
    
      const newMaps = maps.filter((map) => map.id !== mapInfo.id);
      newMaps.push(mapInfo);
      setMaps(newMaps);
      localStorage.setItem("maps", JSON.stringify(newMaps));
    
      addMarker(e.latlng, map, anchorId, MarkerTypes.anchor).openPopup();
    });
    
    
    repo
      .getFile(mapInfo.image)
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        const image = L.imageOverlay(url, bounds).addTo(map);
        map.fitBounds(bounds);
      })
      .catch((error) => {
        console.error(error);
      });

    // unmount map function
    return () => {
      map.remove();
    };
  }, [mapInfo]);

  return (
    <div
      style={{
        padding: 0,
        margin: 0,
        width: "90%",
        height: "67vh",
        border: "1px solid black",
      }}
      ref={(el) => (mapContainer.current = el)}
    ></div>
  );
}

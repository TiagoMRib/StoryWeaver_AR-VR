import React, { useEffect, useRef } from "react";
import { Box } from "@mui/material";
import Frame from "react-frame-component";
import { BASE_URL } from "../../../data/constants";

/**
 * ARCodeScanner - Uses AR.js (NFT) in A-Frame to detect image markers.
 *
 * Props:
 * - characters and locations
 * - onTrigger: callback when a known marker is detected
 */
export default function ARCodeScanner({ storyId,characters, locations, onTrigger }) {
  const iframeRef = useRef(null);


  useEffect(() => {
    const iframe = iframeRef.current?.node?.contentWindow;
    if (!iframe) return;

    // Wait until the iframe A-Frame scene is ready
    const onLoad = () => {
      const scene = iframe.document.querySelector("a-scene");
      if (!scene) return;

      // Monitor markerFound events on all markers
      const markerEls = scene.querySelectorAll("a-nft");
      markerEls.forEach((markerEl) => {
        markerEl.addEventListener("markerFound", () => {
          const name = markerEl.getAttribute("data-name");
          const match = findEntityByMarker(name);
          if (match) {
            console.log("[ARCodeScanner] Marker found:", name);
            onTrigger?.(match);
          }
        });
      });
    };

    iframe.addEventListener("load", onLoad);
    return () => iframe.removeEventListener("load", onLoad);
  }, [characters, locations]);

  const findEntityByMarker = (name) => {
    // Check characters
    const matchChar = characters.find(
      (c) => c.trigger_type?.type === "qr" && c.trigger_type.value === name
    );
    if (matchChar) return matchChar;

    // Check locations
    const matchLoc = locations.find(
      (l) => l.trigger_type?.type === "qr" && l.trigger_type.value === name
    );
    return matchLoc;
  };

  console.log("[Scanner] Project ID:", storyId);

  return (
    <Box sx={{ width: "100%", height: "100%", position: "relative" }}>
      <Frame
        ref={iframeRef}
        style={{ width: "100%", height: "100%", border: "none" }}
        initialContent={`<!DOCTYPE html>
<html>
<head>
  <script src="https://cdn.jsdelivr.net/gh/aframevr/aframe@1.3.0/dist/aframe-master.min.js"></script>
  <script src="https://raw.githack.com/AR-js-org/AR.js/master/aframe/build/aframe-ar-nft.js"></script>
</head>
<body style="margin: 0; overflow: hidden">
  <a-scene embedded arjs>
    ${characters
      .concat(locations)
      .filter((e) => e.trigger_type?.type === "qr")
      .map(
        (e) => {
          // Remove any file extension from the trigger value to get base name
          const baseName = e.trigger_type.value.split('.')[0];
          console.log("[Scanner] Setting up marker for:", baseName);
          return `
      <a-nft
        data-name="${e.trigger_type.value}"
        type="nft"
        url="/files/${storyId}/${baseName}"
        smooth="true"
        smoothCount="10"
        smoothTolerance="0.01"
        smoothThreshold="5"
      ></a-nft>`;
        }
      )
      .join("\n")}
    <a-entity camera></a-entity>
  </a-scene>
</body>
</html>`}
      ></Frame>
    </Box>
  );
}
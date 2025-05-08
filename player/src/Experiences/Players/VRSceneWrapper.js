import React, { useEffect, useRef, useState } from "react";
import { Box, Typography } from "@mui/material";
import "aframe";
import * as THREE from "three";

function getPlayerStartPosition(startName, gltfScene) {
  const startNode = gltfScene.getObjectByName(startName);
  if (startNode) {
    const pos = startNode.position;
    return { position: `${pos.x} ${pos.y} ${pos.z}`, found: true };
  }
  return { position: "0 1.6 0", found: false };
}

function isNear(pos1, pos2, threshold = 1.5) {
  const dx = pos1.x - pos2.x;
  const dy = pos1.y - pos2.y;
  const dz = pos1.z - pos2.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz) < threshold;
}

export default function VRSceneWrapper({
  glbUrl,
  projectData,
  currentNode,
  storyNodes,
  setCurrentNode,
  onSceneLoaded,     // Scene ready
  onSceneReady,      // Camera positioned and ready
  children,
}) {
  const sceneRef = useRef(null);
  const modelRef = useRef(null);
  const triggeredPlaces = useRef(new Set());

  const [statusMessage, setStatusMessage] = useState("Carregando modelo...");
  const [sceneLoaded, setSceneLoaded] = useState(false);
  const [cameraPositioned, setCameraPositioned] = useState(false);

  // A-Frame Scene Ready
  useEffect(() => {
    const sceneEl = sceneRef.current;
    if (!sceneEl) return;

    const handleSceneLoaded = () => {
      console.log("[VR] A-Frame scene fully loaded");
      setSceneLoaded(true);
      if (onSceneLoaded) onSceneLoaded(sceneEl);
    };

    if (sceneEl.hasLoaded) {
      handleSceneLoaded();
    } else {
      sceneEl.addEventListener("loaded", handleSceneLoaded);
    }

    return () => {
      sceneEl.removeEventListener("loaded", handleSceneLoaded);
    };
  }, [onSceneLoaded]);

  // Model Loaded -> Camera Positioned -> Start VR logic
  useEffect(() => {
    if (!glbUrl || cameraPositioned || !modelRef.current) return;

    const modelEntity = modelRef.current;

    const handleModelLoaded = (e) => {
      const gltfScene = e.detail.model;
      const rig = document.querySelector("#cameraRig");
      if (!rig) {
        setStatusMessage("Erro: Rig da câmara não encontrado.");
        return;
      }

      const { position, found } = getPlayerStartPosition(projectData?.vrPlayerStart, gltfScene);
      rig.setAttribute("position", position);
      setStatusMessage(found ? "" : "Atenção: posição inicial padrão usada.");

      console.log("[VR] Modelo carregado. Posição inicial:", position);
      setCameraPositioned(true);
      if (onSceneReady) onSceneReady(); // <<< THIS NOTIFIES PARENT
    };

    modelEntity.addEventListener("model-loaded", handleModelLoaded);
    modelEntity.addEventListener("model-error", (e) => {
      console.error("[VR] Erro ao carregar modelo 3D", e);
      setStatusMessage("Erro: Falha ao carregar o modelo 3D.");
    });

    return () => {
      modelEntity.removeEventListener("model-loaded", handleModelLoaded);
    };
  }, [glbUrl, cameraPositioned, projectData, onSceneReady]);

  // Trigger Zone Check
  useEffect(() => {
    if (!sceneLoaded || !cameraPositioned || !currentNode?.data?.vr) return;

    const gltfScene = modelRef.current?.getObject3D("mesh");
    const rig = document.querySelector("#cameraRig");

    const interval = setInterval(() => {
      const trigger = currentNode.data.vr_type?.trigger_mode;
      const placeName = currentNode.data.place;

      if (trigger !== "ao entrar" || !placeName || !rig || !gltfScene) return;

      const playerPos = rig.object3D.position;
      const target = gltfScene.getObjectByName(placeName);

      if (target && !triggeredPlaces.current.has(placeName)) {
        if (isNear(playerPos, target.position)) {
          console.log("[VR] Entrou no local:", placeName);
          triggeredPlaces.current.add(placeName);

          const targetNode = storyNodes.find(n =>
            n.data?.place === placeName &&
            n.data?.vr === true &&
            n.data?.vr_type === "ao entrar"
          );

          if (targetNode) {
            console.log("[VR] Ativando nó:", targetNode);
            setCurrentNode(targetNode);
          }
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [sceneLoaded, cameraPositioned, currentNode, storyNodes, setCurrentNode]);

  return (
    <Box sx={{ width: "100vw", height: "100vh", position: "relative" }}>
      <a-scene
        ref={sceneRef}
        embedded
        vr-mode-ui="enabled: true"
        loading-screen="enabled: true"
        renderer="antialias: true"
        cursor="rayOrigin: mouse"
        raycaster="objects: .clickable"
      >
        <a-entity ref={modelRef} gltf-model={glbUrl}></a-entity>

        <a-entity id="cameraRig" movement-controls="speed: 0.1">
          <a-entity camera position="0 1.6 0" look-controls wasd-controls />
        </a-entity>

        <a-sky color="#0000FF" />
        {children}
      </a-scene>

      {statusMessage && (
        <Box sx={{
          position: "absolute",
          top: 10,
          left: 10,
          backgroundColor: "rgba(0,0,0,0.7)",
          color: "white",
          padding: 2,
          borderRadius: 2,
        }}>
          <Typography variant="body2">{statusMessage}</Typography>
        </Box>
      )}
    </Box>
  );
}

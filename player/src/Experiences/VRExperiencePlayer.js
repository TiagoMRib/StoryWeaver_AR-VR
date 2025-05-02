import React, { useEffect, useRef, useState } from "react";
import { Box, Typography } from "@mui/material";
import "aframe";

function getPlayerStartPosition(playerStartName, gltfScene) {
  const startName = playerStartName;
  console.log("[VR] Looking for player start node with name:", startName);

  // Log all children names in the glTF scene for debugging
  const allNames = [];
  gltfScene.traverse((node) => {
    if (node.name) allNames.push(node.name);
  });
  console.log("[VR] Available object names in scene:", allNames);

  const startNode = gltfScene.getObjectByName(startName);

  if (startNode) {
    const pos = startNode.position;
    return { position: `${pos.x} ${pos.y} ${pos.z}`, found: true };
  }

  return { position: "0 1.6 0", found: false };
}

export default function VRExperiencePlayer({ gltfUrl, projectData, locations, actors, storyNodes, setNextNode }) {
  const sceneRef = useRef(null);
  const modelRef = useRef(null);
  const [initialized, setInitialized] = useState(false);
  const [statusMessage, setStatusMessage] = useState("Carregando modelo...");

  useEffect(() => {
    console.log("[VR] useEffect running. URL:", gltfUrl, "Initialized:", initialized);
  
    if (!gltfUrl || initialized || !modelRef.current) {
      console.log("[VR] Skipping setup - missing conditions.");
      return;
    }
  
    const modelEntity = modelRef.current;
    console.log("[VR] Model entity found:", modelEntity);
  
    const handleModelLoaded = (e) => {
      console.log("[VR] model-loaded event triggered.");
      const gltfScene = e.detail.model;
      console.log("[VR] Loaded scene:", gltfScene);
  
      const cameraRig = document.querySelector("#cameraRig");
      if (!cameraRig) {
        console.warn("[VR] Camera rig not found.");
        setStatusMessage("Erro: Rig da câmara não encontrado.");
        return;
      }

      console.log("[VR] projectData:", projectData);
  
      const { position, found } = getPlayerStartPosition(projectData?.playerStart, gltfScene);
      console.log("[VR] Setting camera position:", position);
      cameraRig.setAttribute("position", position);
      setInitialized(true);
  
      if (!found) {
        setStatusMessage("Atenção: Posição inicial do jogador não encontrada. Foi usada uma posição padrão.");
      } else {
        setStatusMessage("");
      }
    };
  
    const handleModelError = (e) => {
      console.error("[VR] Erro ao carregar modelo 3D", e);
      setStatusMessage("Erro: Falha ao carregar o modelo 3D. Verifique o ficheiro.");
    };
  
    modelEntity.addEventListener("model-loaded", handleModelLoaded);
    modelEntity.addEventListener("model-error", handleModelError);
  
    return () => {
      modelEntity.removeEventListener("model-loaded", handleModelLoaded);
      modelEntity.removeEventListener("model-error", handleModelError);
    };
  }, [gltfUrl, initialized, locations]);
  

  return (
    <Box sx={{ width: "100vw", height: "100vh", position: "relative" }}>
      <a-scene
        ref={sceneRef}
        embedded
        vr-mode-ui="enabled: true"
        loading-screen="enabled: true"
        renderer="antialias: true"
      >

        <a-entity ref={modelRef} gltf-model={gltfUrl}></a-entity>

        <a-entity id="cameraRig" movement-controls>
          <a-camera
            wasd-controls-enabled="true"
            look-controls
            position="0 1.6 0"
          ></a-camera>
        </a-entity>

        <a-sky color="#ECECEC"></a-sky>
      </a-scene>

      {statusMessage && (
        <Box
          sx={{
            position: "absolute",
            top: 10,
            left: 10,
            backgroundColor: "rgba(0,0,0,0.7)",
            color: "white",
            padding: 2,
            borderRadius: 2,
          }}
        >
          <Typography variant="body2">{statusMessage}</Typography>
        </Box>
      )}
    </Box>
  );
}

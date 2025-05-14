/* global AFRAME */
import React, { useEffect, useRef, useState } from "react";
import { Box, Typography } from "@mui/material";
import "aframe";
import * as THREE from "three";

// Gets player start position from GLTF by name
function getPlayerStartPosition(startName, gltfScene) {
  const startNode = gltfScene.getObjectByName(startName);
  if (startNode) {
    const pos = startNode.position;
    return { position: `${pos.x} ${pos.y} ${pos.z}`, found: true };
  }
  return { position: "0 1.6 0", found: false };
}

// Distance check
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
  onSceneLoaded,
  onSceneReady,
  children,
}) {
  const sceneRef = useRef(null);
  const modelRef = useRef(null);
  const triggeredPlaces = useRef(new Set());

  const [statusMessage, setStatusMessage] = useState("Carregando modelo...");
  const [sceneLoaded, setSceneLoaded] = useState(false);
  const [cameraPositioned, setCameraPositioned] = useState(false);

  // Scene is ready 
  useEffect(() => {
    const sceneEl = sceneRef.current;
    if (!sceneEl) return;

    const handleSceneLoaded = () => {
      setSceneLoaded(true);
      onSceneLoaded?.(sceneEl);
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

  // GLB model loaded -> Position camera -> Notify ready
  useEffect(() => {
    if (!glbUrl || cameraPositioned || !modelRef.current) return;

    const modelEntity = modelRef.current;

    const handleModelLoaded = (e) => {
      const gltfScene = e.detail.model;

      // Double-side all meshes + static-body setup
      gltfScene.traverse((node) => {
        if (node.isMesh) {
          node.frustumCulled = false;
          if (node.material) node.material.side = THREE.DoubleSide;
          if (node.el) node.el.setAttribute("static-body", "");
        }
      });

      const rig = document.querySelector("#cameraRig");
      if (!rig) {
        setStatusMessage("Erro: Rig da câmara não encontrado.");
        return;
      }

      const { position, found } = getPlayerStartPosition(projectData?.vrPlayerStart, gltfScene);
      rig.setAttribute("position", position);
      setStatusMessage(found ? "" : "Atenção: posição inicial padrão usada.");

      setCameraPositioned(true);
      onSceneReady?.();
    };

    modelEntity.addEventListener("model-loaded", handleModelLoaded);
    modelEntity.addEventListener("model-error", () => {
      setStatusMessage("Erro: Falha ao carregar o modelo 3D.");
    });

    return () => {
      modelEntity.removeEventListener("model-loaded", handleModelLoaded);
    };
  }, [glbUrl, cameraPositioned, projectData, onSceneReady]);

  // Check "ao entrar"
  useEffect(() => {
    if (!sceneLoaded || !cameraPositioned || !currentNode?.data?.vr) return;

    const rig = document.querySelector("#cameraRig");
    const gltfScene = modelRef.current?.getObject3D("mesh");

    const interval = setInterval(() => {
      const trigger = currentNode.data.vr_type?.trigger_mode;
      const placeName = currentNode.data.place;

      if (trigger !== "ao entrar" || !placeName || !rig || !gltfScene) return;

      const playerPos = rig.object3D.position;
      const target = gltfScene.getObjectByName(placeName);

      if (target && !triggeredPlaces.current.has(placeName)) {
        if (isNear(playerPos, target.position)) {
          triggeredPlaces.current.add(placeName);

          const targetNode = storyNodes.find(n =>
            n.data?.place === placeName &&
            n.data?.vr === true &&
            n.data?.vr_type === "ao entrar"
          );

          if (targetNode) {
            setCurrentNode(targetNode);
          }
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [sceneLoaded, cameraPositioned, currentNode, storyNodes, setCurrentNode]);

  // Mudar a fonte - didnt work
  useEffect(() => {
    const scene = document.querySelector("a-scene");
    if (!scene) return;

    scene.addEventListener("loaded", () => {
      AFRAME.components.text.schema.font.default = "/fonts/roboto-msdf.json";
      AFRAME.components.text.schema.shader.default = "msdf";
    });
  }, []);

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
        physics="debug: false"
      >
        <a-entity ref={modelRef} gltf-model={glbUrl}></a-entity>

        <a-entity id="cameraRig" dynamic-body="mass: 1" movement-controls="speed: 0.1">
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

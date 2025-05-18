/* global AFRAME */
import React, { useEffect, useRef, useState } from "react";
import { Box, Typography } from "@mui/material";
import "aframe";
import "aframe-extras";
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
  hasTriggered,         
  setHasTriggered,      
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

          if (projectData.characters.some(c => c.name === node.name)) {
    if (node.el) node.el.classList.add("clickable");
  }
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

  // Interação com atores

  useEffect(() => {
  if (!sceneRef.current) return;

  const sceneEl = sceneRef.current;

  const handleClick = (evt) => {
    const intersection = evt.detail?.intersection;
    if (!intersection) return;

    const clickedMesh = intersection.object;
    const clickedName = clickedMesh?.name;
    console.log("[VRPlayer] Raycast clicked mesh:", clickedName);

    // If current node expects interaction
    if (
      currentNode?.data?.vr &&
      currentNode.data.vr_type?.trigger_mode === "Ao interagir com ator" &&
      !hasTriggered
    ) {
      const expectedActorId = currentNode.data.vr_type.actor_id;
      const expectedCharacter = projectData.characters.find(c => c.id === expectedActorId);
      console.log("[Wrapper] expectedCharacter:", expectedCharacter.name);
      if (!expectedCharacter) return;

      if (clickedName === expectedCharacter.name) {
        console.log(`[VRPlayer] Correct actor "${clickedName}" clicked`);
        setHasTriggered(true);
      } else {
        console.log(`[VRPlayer] Clicked "${clickedName}" but expected "${expectedCharacter.name}" — ignoring`);
      }
    }
  };

  sceneEl.addEventListener("click", handleClick);

  return () => {
    sceneEl.removeEventListener("click", handleClick);
  };
}, [sceneRef, currentNode, setHasTriggered, setCurrentNode, projectData]);



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
        physics="debug: true"
      >
        <a-entity ref={modelRef} gltf-model={glbUrl}></a-entity>

        <a-entity
          id="cameraRig"
          dynamic-body="mass: 1; shape: capsule; height: 1.6; radius: 0.35"
          aframe-extras-physics-controls
          wasd-controls="acceleration: 30"
          look-controls
          position="0 1.6 0"
        >
          <a-entity
            camera
            position="0 1.6 0"
          ></a-entity>
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

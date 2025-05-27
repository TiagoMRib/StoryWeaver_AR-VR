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
  return { position: "0 0.5 0", found: false };
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
  story,
  currentNode,
  setCurrentNode,
  projectInfo,
  locations,
  characters,
  onSceneLoaded,
  onSceneReady,
  hasTriggered,
  setHasTriggered,
  children,
}) {
  const sceneRef = useRef(null);
  const modelRef = useRef(null);
  const triggered = useRef(new Set());

  const [statusMessage, setStatusMessage] = useState("Carregando modelo...");
  const [sceneLoaded, setSceneLoaded] = useState(false);
  const [cameraPositioned, setCameraPositioned] = useState(false);

  // Scene loaded
  useEffect(() => {
    const sceneEl = sceneRef.current;
    if (!sceneEl) return;

    const handleSceneLoaded = () => {
      setSceneLoaded(true);
      onSceneLoaded?.(sceneEl);
    };

    if (sceneEl.hasLoaded) handleSceneLoaded();
    else sceneEl.addEventListener("loaded", handleSceneLoaded);

    return () => sceneEl.removeEventListener("loaded", handleSceneLoaded);
  }, [onSceneLoaded]);

  // Model loaded -> position camera
  useEffect(() => {
    if (!glbUrl || cameraPositioned || !modelRef.current) return;

    const entity = modelRef.current;
    const onLoad = (e) => {
      const gltfScene = e.detail.model;
      gltfScene.traverse(node => {
        if (node.isMesh) {
          node.frustumCulled = false;
          if (node.material) node.material.side = THREE.DoubleSide;
          if (node.el && !node.el.hasAttribute("static-body")) {
            node.el.setAttribute("static-body", { shape: "box" });
          }
          // mark clickable
          if (projectInfo.characters?.some(c => c.threeDObject === node.name)) {
            node.el?.classList.add("clickable");
          }
        }
      });

      const rig = sceneRef.current?.querySelector("#cameraRig");
      if (!rig) {
        setStatusMessage("Erro: Rig da câmara não encontrado.");
        return;
      }

      const { position, found } = getPlayerStartPosition(projectInfo.vrPlayerStart, gltfScene);
      rig.setAttribute("position", position);
      setStatusMessage(found ? "" : "Atenção: posição inicial padrão usada.");

      setCameraPositioned(true);
      onSceneReady?.();
    };

    entity.addEventListener("model-loaded", onLoad);
    return () => entity.removeEventListener("model-loaded", onLoad);
  }, [glbUrl, cameraPositioned, projectInfo, onSceneReady]);

  // Generic trigger handling
  useEffect(() => {
    if (!sceneLoaded || !cameraPositioned || !currentNode) return;

    const { trigger } = currentNode;
    if (!trigger) return;

    const interactionDef = projectInfo.interactions.find(i => i.type === trigger.interaction);
    if (!interactionDef) return;

    const method = interactionDef.methodVr;
    const targetLabel = trigger.target;
    // resolve 3D name
    const targetName = (
      projectInfo.locations.find(l => l.name === targetLabel)?.threeDObject ||
      projectInfo.characters.find(c => c.name === targetLabel)?.threeDObject ||
      targetLabel
    );

    if (method === "proximity") {
      const interval = setInterval(() => {
        const rig = sceneRef.current?.querySelector("#cameraRig");
        const playerPos = rig?.object3D.position;
        const mesh = modelRef.current.getObject3D('mesh')?.getObjectByName(targetName);
        if (playerPos && mesh && !triggered.current.has(targetName) && isNear(playerPos, mesh.position)) {
          triggered.current.add(targetName);
          setHasTriggered(true);
        }
      }, 500);
      return () => clearInterval(interval);
    }

    if (method === "primary" || method === "secondary") {
      const sceneEl = sceneRef.current;
      const event = method === "primary" ? "click" : "contextmenu";
      const handler = evt => {
        const object = evt.detail?.intersection?.object;
        if (object?.name === targetName && !hasTriggered) {
          setHasTriggered(true);
        }
      };
      sceneEl.addEventListener(event, handler);
      return () => sceneEl.removeEventListener(event, handler);
    }

  }, [sceneLoaded, cameraPositioned, currentNode, projectInfo, hasTriggered, setHasTriggered]);

  // font patch
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
          <a-entity camera position="0 1.6 0"></a-entity>
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

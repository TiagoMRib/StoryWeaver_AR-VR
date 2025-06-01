/* global AFRAME */
import React, { useEffect, useRef, useState } from "react";
import { Box, Typography } from "@mui/material";
import "aframe";
import "aframe-extras";
import * as THREE from "three";

function getPlayerStartPosition(start_location_name, gltfScene, locations) {
  console.log("Start location name:", start_location_name);

  // Find location by name
  const location = locations?.find(loc => loc.name === start_location_name);
  console.log("Start Location found:", location);
  const targetObjectName = location?.threeDObject;

  if (!targetObjectName || !gltfScene) {
    return { position: "0 0.5 0", found: false };
  }

  const object = gltfScene.getObjectByName(targetObjectName);

  console.log("Start object found:", object);

  if (object) {
    const pos = object.position;
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
  locations,
  characters,
  interactions,
  onSceneLoaded,
  onSceneReady,
  hasTriggered,
  setHasTriggered,
  startPosition,
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

    function findCharacterGroup(node, characters) {
      let current = node.parent;
      while (current) {
        if (characters.some(c => c.threeDObject === current.name)) {
          return current;
        }
        current = current.parent;
      }
      return null;
    }

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
          const parentGroup = findCharacterGroup(node, characters);
          if (parentGroup?.el) {
            console.log("[VRSceneWrapper] Marking parent group as clickable:", parentGroup.name);
            parentGroup.el.classList.add("clickable");
          }
        }
      });

      const rig = sceneRef.current?.querySelector("#cameraRig");
      if (!rig) {
        setStatusMessage("Erro: Rig da câmara não encontrado.");
        return;
      }

      const { position, found } = getPlayerStartPosition(startPosition, gltfScene, locations);
      rig.setAttribute("position", position);
      setStatusMessage(found ? "" : "Atenção: posição inicial padrão usada.");

      setCameraPositioned(true);
      onSceneReady?.();
    };

    entity.addEventListener("model-loaded", onLoad);
    return () => entity.removeEventListener("model-loaded", onLoad);
  }, [glbUrl, cameraPositioned, onSceneReady]);

  // Generic trigger handling
  useEffect(() => {
    if (!sceneLoaded || !cameraPositioned || !currentNode) return;

    const { trigger } = currentNode;
    if (!trigger) return;

    console.log("[VRSceneWrapper] Trigger detected", trigger, "Current Node:", currentNode);

    const interactionDef = interactions?.find(i => i.type === trigger.interaction);
    if (!interactionDef) return;

    console.log("[VRSceneWrapper] Interaction definition found:", interactionDef);

    const method = interactionDef.methodVr;
    const targetLabel = trigger.target;

    console.log("Finding target:", targetLabel);
    console.log("Locations:", locations);
    console.log("Characters:", characters);
    // resolve 3D name
    const targetName = (
      locations.find(l => l.name === targetLabel)?.threeDObject ||
      characters.find(c => c.name === targetLabel)?.threeDObject ||
      targetLabel
    );

    console.log("[VRSceneWrapper] Target name:", targetName);

    const getNamedParent = (object, targetName) => {
      let current = object;
      while (current) {
        if (current.name === targetName) return current;
        current = current.parent;
      }
      return null;
    };

    if (method === "proximity") {
      const interval = setInterval(() => {
        const rig = sceneRef.current?.querySelector("#cameraRig");
        const playerPos = rig?.object3D.position;
        const mesh = modelRef.current.getObject3D('mesh')?.getObjectByName(targetName);
        if (playerPos && mesh && !triggered.current.has(targetName) && isNear(playerPos, mesh.position)) {
          triggered.current.add(targetName);
          setHasTriggered(true);
          console.log("[VRSceneWrapper] Proximity trigger activated for:", targetName);
        }
      }, 500);
      return () => clearInterval(interval);
    }

    if (method === "primary" || method === "secondary") {

      
      const sceneEl = sceneRef.current;
      const event = method === "primary" ? "click" : "contextmenu";
      const handler = (evt) => {
        const intersected = evt.detail?.intersection?.object;
        if (!intersected || hasTriggered) return;

        const targetObject = getNamedParent(intersected, targetName);

        if (targetObject) {
          console.log("[VRSceneWrapper] Triggered by clicking:", targetObject.name);
          setHasTriggered(true);
        } else {
          console.log("[VRSceneWrapper] Clicked on", intersected.name, "but no matching ancestor for", targetName);
        }
      };
      sceneEl.addEventListener(event, handler);
      return () => sceneEl.removeEventListener(event, handler);
    }

  }, [sceneLoaded, cameraPositioned, currentNode, hasTriggered, setHasTriggered]);

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

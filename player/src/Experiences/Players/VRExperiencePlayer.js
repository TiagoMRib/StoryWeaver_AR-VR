import React, { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import BeginNodeDisplay from "../NodesDisplay/BeginNodeDisplay";
import EndNodeDisplay from "../NodesDisplay/EndNodeDisplay";
import QuizNodeDisplay from "../NodesDisplay/QuizNodeDisplay";
import TextNodeDisplay from "../NodesDisplay/TextNodeDisplay";
import VRSceneWrapper from "./VRSceneWrapper";
import * as THREE from "three";

export default function VRExperiencePlayer({
  glbUrl,
  experienceName,
  locations,
  characters,
  interactions,
  story,
  setNextNode,
  setExperience,
  repo,
}) {
  const [currentNode, setCurrentNode] = useState(null);
  const [hasTriggered, setHasTriggered] = useState(false);
  const [sceneEl, setSceneEl] = useState(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [startPosition, setStartPosition] = useState("0 1.6 0");

  useEffect(() => {
    const beginNode = story.find((node) => node.action === "begin");
    if (beginNode) {
      setStartPosition(beginNode.location);
      setCurrentNode(beginNode);
      setNextNode?.(beginNode);
    }
  }, [story]);

  useEffect(() => {
    setHasTriggered(false);
  }, [currentNode]);

  useEffect(() => {
    if (!currentNode || !sceneEl) return;

    const { trigger } = currentNode;
    if (!trigger || hasTriggered) return;

    const interval = setInterval(() => {
      if (isPlayerNearObject(trigger.target)) {
        console.log(`[VR] Triggered by proximity to ${trigger.target}`);
        setHasTriggered(true);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [currentNode, sceneEl, hasTriggered]);

  const handleSceneLoaded = (scene) => {
    setSceneEl(scene);
  };

  const resolveNextNode = (fromNode, choiceIndex = null) => {
    if (fromNode.action === "choice" && choiceIndex !== null) {
      const goToId = fromNode.data.options[choiceIndex].goToStep;
      return story.find((n) => n.id === goToId);
    }
    return story.find((n) => n.id === fromNode.goToStep);
  };

  const handleAdvance = (choiceIndex = null) => {
    if (!currentNode) return;

    if (currentNode.action === "end") {
      setExperience?.(undefined);
      return;
    }

    const next = resolveNextNode(currentNode, choiceIndex);
    if (next) setCurrentNode(next);
  };

  const isPlayerNearObject = (objectName, threshold = 5) => {
    const cameraObj = sceneEl?.querySelector("[camera]")?.object3D;
    let targetObj = null;

    sceneEl?.object3D?.traverse((child) => {
      if (child.name === objectName) {
        targetObj = child;
      }
    });

    if (!cameraObj || !targetObj) return false;

    const playerPos = new THREE.Vector3();
    const targetPos = new THREE.Vector3();
    cameraObj.getWorldPosition(playerPos);
    targetObj.getWorldPosition(targetPos);

    return playerPos.distanceTo(targetPos) < threshold;
  };

  const renderTriggerIndicator = (targetLabel) => {
    if (!sceneEl || !targetLabel) return null;

    console.log("[VRIndicator] Rendering for target label:", targetLabel);

    const targetName =
      locations.find((l) => l.name === targetLabel)?.threeDObject ||
      characters.find((c) => c.name === targetLabel)?.threeDObject ||
      targetLabel;

    console.log("[VRIndicator] Resolved to 3D object name:", targetName);

    const model = sceneEl.querySelector("[gltf-model]")?.getObject3D("mesh");
    if (!model) {
      console.warn("[VRIndicator] No model mesh loaded.");
      return null;
    }

    // Try direct mesh match first
    let targetObject = model.getObjectByName(targetName);

    // If not found, try climbing up from child meshes
    if (!targetObject) {
      model.traverse((child) => {
        if (child.isMesh && !targetObject) {
          const maybeGroup = getNamedParent(child, targetName);
          if (maybeGroup) {
            targetObject = maybeGroup;
          }
        }
      });
    }

    if (!targetObject) {
      console.warn("[VRIndicator] Couldn't find object or group for:", targetName);
      return null;
    }

    const pos = new THREE.Vector3();
    targetObject.getWorldPosition(pos);
    pos.y += 1.8;

    return (
      <a-entity position={`${pos.x} ${pos.y} ${pos.z}`}>
        <a-octahedron
          radius="0.2"
          color="#90EE90"
          animation="property: rotation; to: 0 360 0; loop: true; dur: 3000"
        />
      </a-entity>
    );
  };

  const getNamedParent = (object, targetName) => {
    let current = object;
    while (current) {
      if (current.name === targetName) return current;
      current = current.parent;
    }
    return null;
  };



  const renderPromptInFront = (text) => {
    const cam = sceneEl?.querySelector("[camera]");
    const camObj = cam?.object3D;
    if (!camObj) return null;

    const playerPos = new THREE.Vector3();
    const forward = new THREE.Vector3();
    camObj.getWorldPosition(playerPos);
    camObj.getWorldDirection(forward);
    forward.normalize();

    const labelPos = playerPos.clone().add(forward.multiplyScalar(-3));
    labelPos.y = Math.max(labelPos.y, 1.2);

    const lookAtQuat = new THREE.Quaternion().setFromRotationMatrix(
      new THREE.Matrix4().lookAt(labelPos, playerPos, new THREE.Vector3(0, 1, 0))
    );
    const euler = new THREE.Euler().setFromQuaternion(lookAtQuat);

    return (
      <a-entity position={`${labelPos.x} ${labelPos.y} ${labelPos.z}`} rotation={`${euler.x} ${euler.y} ${euler.z}`}>
        <a-text
          value={text}
          color="white"
          align="center"
          wrap-count="40"
          position="0 0 0.01"
        ></a-text>
      </a-entity>
    );
  };

  const renderNode = () => {
    if (!currentNode) return null;

    const { trigger } = currentNode;

    if (trigger && !hasTriggered) {
      const { interaction, target } = trigger;

      console.log("[VRPlayer] interaction type:", interaction);
      console.log("[VRPlayer] Current node trigger:", trigger);

      console.log("[VRPlayer] Interactions available:", interactions);

      // Get the interaction definition by type
      const interactionDef = interactions.find((i) => i.type === interaction);

      if (!interactionDef) {
        console.warn("[VRPlayer] Unknown interaction type:", interaction);
        return null;
      }

      const method = interactionDef.methodVr;
      const label = interactionDef.label || interaction;

      // Proximity (go near)
      if (method === "proximity") {
        return (
          <>
            {renderPromptInFront(`Dirije-te até: ${target}`)}
            {renderTriggerIndicator(target)}
          </>
        );
      }

      // All other interaction methods (click, talk, button press, etc)
      return (
        <>
          {renderPromptInFront(`${label} com: ${target} (${method})`)}
          {renderTriggerIndicator(target)}
        </>
      );
    }

    // Auto-skip special nodes
    if (currentNode.action === "begin-dialogue" || currentNode.action === "end-dialogue") {
      handleAdvance();
      return null;
    }

    switch (currentNode.action) {
      case "begin":
        return (
          <BeginNodeDisplay
            mode="vr"
            startPosition={startPosition}
            node={currentNode}
            onNext={handleAdvance}
            experienceName={experienceName}
          />
        );
      case "text":
        return (
          <TextNodeDisplay
            mode="vr"
            node={currentNode}
            onNext={handleAdvance}
            characters={characters}
          />
        );
      case "choice":
        return (
          <QuizNodeDisplay
            mode="vr"
            node={currentNode}
            onNext={handleAdvance}
            characters={characters}
          />
        );
      case "end":
        return (
          <EndNodeDisplay
            mode="vr"
            node={currentNode}
            onNext={handleAdvance}
          />
        );
      default:
        return <Typography>Esta cena não é suportada no modo VR. ({currentNode.action})</Typography>;
    }
  };

  return (
    <Box sx={{ width: "100%", height: "100%" }}>
      <VRSceneWrapper
        glbUrl={glbUrl}
        story={story}
        currentNode={currentNode}
        setCurrentNode={setCurrentNode}
        locations={locations}
        characters={characters}
        interactions={interactions}
        onSceneLoaded={handleSceneLoaded}
        onSceneReady={() => setCameraReady(true)}
        hasTriggered={hasTriggered}
        setHasTriggered={setHasTriggered}
        startPosition={startPosition}
      >
        {renderNode()}
      </VRSceneWrapper>
    </Box>
  );
}

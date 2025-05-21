import React, { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import { NodeType } from "../../models/NodeTypes";
import BeginNodeDisplay from "../NodesDisplay/BeginNodeDisplay";
import EndNodeDisplay from "../NodesDisplay/EndNodeDisplay";
import QuizNodeDisplay from "../NodesDisplay/QuizNodeDisplay";
import DialogueNodeDisplay from "../NodesDisplay/DialogueNodeDisplay";
import TextNodeDisplay from "../NodesDisplay/TextNodeDisplay";
import VRSceneWrapper from "./VRSceneWrapper";
import * as THREE from "three";

export default function VRExperiencePlayer({
  glbUrl,
  projectData,
  locations,
  actors,
  storyNodes,
  setNextNode,
  setExperience,
  repo,
}) {
  const [currentNode, setCurrentNode] = useState(null);
  const [nextNodes, setNextNodes] = useState([]);
  const [hasTriggered, setHasTriggered] = useState(false);
  const [sceneEl, setSceneEl] = useState(null);
  const [cameraReady, setCameraReady] = useState(false);

  /**
   * Initializes the experience with the Begin Node.
   */
  useEffect(() => {
    const beginNode = projectData.nodes.find((node) => node.type === NodeType.beginNode);
    if (beginNode) {
      updateCurrentNode(beginNode);
    }
  }, [projectData]);

  /**
   * Reset trigger state whenever the current node changes.
   */
  useEffect(() => {
    console.log("[VRPlayer] Current node changed:", currentNode?.id);
    setHasTriggered(false);
    console.log("[VRPlayer] Trigger state reset to", hasTriggered);
  }, [currentNode]);

  /**
   * Periodic check to detect if player entered a trigger zone (e.g., location).
   */
  useEffect(() => {
    if (!currentNode || !sceneEl) return;

    const { vr, vr_type } = currentNode.data || {};
    const { trigger_mode, place } = vr_type || {};

    if (!(vr && trigger_mode === "Ao entrar" && place) || hasTriggered) return;

    const interval = setInterval(() => {
      if (isPlayerNearObject(place)) {
        console.log(`[VRPlayer] Player entered ${place}`);
        setHasTriggered(true);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [currentNode, sceneEl, hasTriggered]);

  /**
   * Get connected nodes for the current one.
   */
  const getNextNodes = (node) => {
    const nextIds = projectData.edges.filter((e) => e.source === node.id).map((e) => e.target);
    return projectData.nodes.filter((n) => nextIds.includes(n.id));
  };

  /**
   * Updates current node and computes next possible nodes.
   */
  const updateCurrentNode = (node) => {
    if (!node) {
      console.warn("[VRPlayer] Tried to set undefined node");
      return;
    }
    setCurrentNode(node);
    setNextNodes(getNextNodes(node));
    setNextNode?.(node);
  };

  const handleSceneLoaded = (scene) => {
    console.log("[VRPlayer] Scene loaded");
    setSceneEl(scene);
  };

  /**
   * Checks if the player is within a certain distance to an object in the scene.
   */
  const isPlayerNearObject = (objectName, threshold = 5) => {
    const cameraObj = sceneEl?.querySelector("[camera]")?.object3D;
    const rootObj = sceneEl?.object3D;
    let targetObj = null;

    rootObj?.traverse((child) => {
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

  /**
   * Displays an instruction label in front of the camera.
   */
  const renderGoToLocationPrompt = (placeName) => {
    const camera = sceneEl?.querySelector("[camera]");
    const cameraObj = camera?.object3D;

    if (!cameraObj) return null;

    const playerPos = new THREE.Vector3();
    const forwardDir = new THREE.Vector3();
    cameraObj.getWorldPosition(playerPos);
    cameraObj.getWorldDirection(forwardDir);

    forwardDir.normalize();
    const labelPos = playerPos.clone().add(forwardDir.multiplyScalar(-3));
    labelPos.y = Math.max(labelPos.y, 1.2);
    const posStr = `${labelPos.x} ${labelPos.y} ${labelPos.z}`;

    const lookAtQuat = new THREE.Quaternion().setFromRotationMatrix(
      new THREE.Matrix4().lookAt(labelPos, playerPos, new THREE.Vector3(0, 1, 0))
    );
    const euler = new THREE.Euler().setFromQuaternion(lookAtQuat);

    return (
      <a-entity position={posStr} rotation={`${euler.x} ${euler.y} ${euler.z}`}>
        <a-text
          value={`Continua em ${placeName}`}
          color="white"
          align="center"
          wrap-count="40"
          position="0 0 0.01"
        ></a-text>
      </a-entity>
    );
  };

 /**
  * 
  * displays a cone over the object
  * 
  */
  const renderTriggerIndicator = (targetName) => {
    console.log("[Indicator] Rendering trigger indicator for:", targetName);
    

    const model = sceneEl?.querySelector('[gltf-model]')?.getObject3D('mesh');
    let object = null;

    model?.traverse((child) => {
      if (child.name === targetName) {
        object = child;
      }
    });

    if (!object) {
      console.warn("[TriggerIndicator] Could not find object for:", targetName);
      return;
    }

    const pos = new THREE.Vector3();
    object.getWorldPosition(pos);
    pos.y += 1.5; // raise it above the object

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

  /**
   * Renders the current node using appropriate display component.
   */
  const renderNode = () => {
    if (!currentNode) return null;

    console.log("[VRPlayer] Rendering node:", currentNode?.id, "| Triggered:", hasTriggered);

    const { vr, vr_type } = currentNode.data || {};
    const { trigger_mode, place } = vr_type || {};
    

    if (vr && trigger_mode === "Ao entrar" && place && !hasTriggered) {
      const prompt = renderGoToLocationPrompt(place);
      const indicator = renderTriggerIndicator(place);
      return (
        <>
          {prompt}
          {indicator}
        </>
      );
    }
    if (vr && trigger_mode === "Ao interagir com ator" && !hasTriggered) {
      const expectedActorId = vr_type.actor_id;
      console.log("[VRPlayer] currentNode.data.vr_type.character:", expectedActorId);
      const expectedCharacter = projectData.characters.find(c => c.id === expectedActorId);
      const objectName = expectedCharacter?.name || "objeto desconhecido";

      const indicator = renderTriggerIndicator(objectName);

      console.log(`[VRPlayer] Waiting for interaction with: ${objectName}`);

      const camera = sceneEl?.querySelector("[camera]");
      const cameraObj = camera?.object3D;

      if (!cameraObj) return null;

      const playerPos = new THREE.Vector3();
      const forwardDir = new THREE.Vector3();
      cameraObj.getWorldPosition(playerPos);
      cameraObj.getWorldDirection(forwardDir);

      forwardDir.normalize();
      const labelPos = playerPos.clone().add(forwardDir.multiplyScalar(-3));
      labelPos.y = Math.max(labelPos.y, 1.2);
      const posStr = `${labelPos.x} ${labelPos.y} ${labelPos.z}`;

      const lookAtQuat = new THREE.Quaternion().setFromRotationMatrix(
        new THREE.Matrix4().lookAt(labelPos, playerPos, new THREE.Vector3(0, 1, 0))
      );
      const euler = new THREE.Euler().setFromQuaternion(lookAtQuat);

      return (
        <>
        <a-entity position={posStr} rotation={`${euler.x} ${euler.y} ${euler.z}`}>
          <a-text
            value={`Interage com o objeto: ${objectName}`}
            color="white"
            align="center"
            wrap-count="40"
            position="0 0 0.01"
          ></a-text>
        </a-entity>
        {indicator}
        </>
      );
    }
    console.log("[Render] Passed trigger check, rendering type:", currentNode.type);

    switch (currentNode.type) {
      case NodeType.beginNode:
        console.log("[Render] Rendering begin node");
        return (
          <BeginNodeDisplay
            mode="vr"
            spawnPoint={projectData.vrPlayerStart}
            node={currentNode}
            possibleNextNodes={nextNodes}
            setNextNode={updateCurrentNode}
            experienceName={projectData.experienceName}
          />
        );
      case NodeType.characterNode:
        console.log("[Render] Rendering dialog node");
        return (
          <DialogueNodeDisplay
            mode="vr"
            node={currentNode}
            possibleNextNodes={nextNodes}
            setNextNode={updateCurrentNode}
            outGoingEdges={projectData.edges.filter(e => e.source === currentNode.id)}
          />
        );
      case NodeType.quizNode:
        console.log("[Render] Rendering quiz node");
        return (
          <QuizNodeDisplay
            mode="vr"
            node={currentNode}
            possibleNextNodes={nextNodes}
            setNextNode={updateCurrentNode}
            experienceName={projectData.projectTitle}
            outGoingEdges={projectData.edges.filter(e => e.source === currentNode.id)}
            hasTriggered={hasTriggered}
          />
        );
      case NodeType.textNode:
        console.log("[Render] Rendering text node");
        return (
          <TextNodeDisplay
            mode="vr"
            node={currentNode}
            possibleNextNodes={nextNodes}
            setNextNode={updateCurrentNode}
          />
        );
      case NodeType.endNode:
        console.log("[Render] Rendering end node");
        return (
          <EndNodeDisplay
            mode="vr"
            node={currentNode}
            experienceName={projectData.projectTitle}
            setNextNode={() =>
              repo
                ?.markEndingObtained?.(
                  projectData.id,
                  currentNode.data.id,
                  projectData.projectTitle,
                  projectData.storyEndings
                )
                .then(() => setExperience(undefined))
                .catch(console.error)
            }
          />
        );
      default:
        console.log("[Render] Not supported node type:", currentNode.type);
        return <Typography>Esta cena não é suportada no modo VR.</Typography>;
    }
  };

  return (
    <Box sx={{ width: "100%", height: "100%" }}>
      <VRSceneWrapper
        glbUrl={glbUrl}
        currentNode={currentNode}
        storyNodes={storyNodes}
        setCurrentNode={updateCurrentNode}
        projectData={projectData}
        locations={locations}
        actors={actors}
        onSceneLoaded={handleSceneLoaded}
        onSceneReady={() => setCameraReady(true)}
        hasTriggered={hasTriggered}
        setHasTriggered={setHasTriggered}
      >
        {renderNode()}
      </VRSceneWrapper>
    </Box>
  );
}

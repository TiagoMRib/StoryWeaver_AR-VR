import React, { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import { NodeType } from "../../models/NodeTypes";

import BeginNodeDisplay from "../NodesDisplay/BeginNodeDisplay";
import EndNodeDisplay from "../NodesDisplay/EndNodeDisplay";
import DialogueNodeDisplay from "../NodesDisplay/DialogueNodeDisplay";

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
  repo
}) {
  const [currentNode, setCurrentNode] = useState(null);
  const [nextNodes, setNextNodes] = useState([]);
  const [sceneEl, setSceneEl] = useState(null); // Reference to the A-Frame scene
  const [cameraReady, setCameraReady] = useState(false);

  useEffect(() => {
    const beginNode = projectData.nodes.find(
      (node) => node.type === NodeType.beginNode
    );
    if (beginNode) {
      console.log("[VRPlayer] Initial node:", beginNode);
      setCurrentNode(beginNode);
      const next = getNextNodes(beginNode);
      setNextNodes(next);
    }
  }, [projectData]);

  const getNextNodes = (node) => {
    const nextIds = projectData.edges
      .filter((edge) => edge.source === node.id)
      .map((edge) => edge.target);
    return projectData.nodes.filter((n) => nextIds.includes(n.id));
  };

  const handleSetCurrentNode = (node) => {
    setCurrentNode(node);
    setNextNodes(getNextNodes(node));
    if (setNextNode) setNextNode(node);
  };

  // Called once A-Frame scene is fully loaded
  const handleSceneLoaded = (scene) => {
    console.log("[VRPlayer] A-Frame scene ready");
    setSceneEl(scene);
  };

  // Creates a 2D panel entity for a node inside the A-Frame scene - DEV FUNCTION
  /*
  const spawnNodePanel = (node) => {
    if (!sceneEl || !node) return;

    // Remove previous panels
    const oldPanels = sceneEl.querySelectorAll(".node-panel");
    oldPanels.forEach((el) => el.parentNode.removeChild(el));

    const rig = sceneEl.querySelector("#cameraRig");
    if (!rig) {
      console.warn("[VRPlayer] No camera rig found.");
      return;
    }

    const camera = rig.querySelector("[camera]");
    const camObj = camera?.object3D;
    if (!camObj) {
      console.warn("[VRPlayer] No camera object3D.");
      return;
    }

    // Create panel in front of the camera
    const panel = document.createElement("a-entity");
    panel.classList.add("node-panel");
    panel.setAttribute("geometry", {
      primitive: "plane",
      width: 1.2,
      height: 0.6,
    });
    panel.setAttribute("material", {
      color: "#222",
      opacity: 0.9,
    });

    // Use a look-at component so it faces the player
    const camWorldPos = new THREE.Vector3();
    camObj.getWorldPosition(camWorldPos);
    panel.object3D.position.set(camWorldPos.x - 2, camWorldPos.y, camWorldPos.z);
    panel.object3D.lookAt(camWorldPos);

    // Add dynamic text content
    panel.setAttribute("text", {
      value: `[${node.type}] ${node.data?.text || "Sem conteúdo"}`,
      align: "center",
      width: 1.1,
      color: "#FFF",
      wrapCount: 30,
    });

    sceneEl.appendChild(panel);
    console.log("[VRPlayer] Spawned 3D panel for node:", node);
  };

  // Spawn panel whenever the node or scene changes
  useEffect(() => {
    if (sceneEl && currentNode?.data?.vr !== false) {
      spawnNodePanel(currentNode);
    }
  }, [sceneEl, currentNode]);
  */

  // Not being used 
  const renderNode = () => {
    if (!currentNode) return null;
    console.log("[VRPlayer] Current node type:", currentNode?.type);
    switch (currentNode.type) {
      case NodeType.beginNode:
        console.log("[VRPlayer] Begin node:", projectData.projectTitle);
        return (
          <BeginNodeDisplay
            mode="vr"
            node={currentNode}
            possibleNextNodes={nextNodes}
            setNextNode={handleSetCurrentNode}
            experienceName={projectData.projectTitle}
          />
        );
      case NodeType.characterNode:
        return (
          <DialogueNodeDisplay
            mode="vr"
            node={currentNode}
            possibleNextNodes={nextNodes}
            setNextNode={handleSetCurrentNode}
            outGoingEdges={projectData.edges.filter(
              (edge) => edge.source === currentNode.id
            )}
          />
        );
        case NodeType.endNode:
          return (
            <EndNodeDisplay
              mode="vr"
              node={currentNode}
              experienceName={projectData.projectTitle}
              setNextNode={() => {
                repo
                  ?.markEndingObtained?.(
                    projectData.id,
                    currentNode.data.id,
                    projectData.projectTitle,
                    projectData.storyEndings
                  )
                  .then(() => setExperience(undefined))
                  .catch(console.error);
              }}
            />
          );
      default:
        return <Typography>Esta cena não é suportada no modo VR.</Typography>;
    }
  };

  return (
    <Box sx={{ width: "100%", height: "100%" }}>
      <VRSceneWrapper
        glbUrl={glbUrl}
        currentNode={currentNode}
        storyNodes={storyNodes}
        setCurrentNode={handleSetCurrentNode}
        projectData={projectData}
        locations={locations}
        actors={actors}
        onSceneLoaded={handleSceneLoaded}
        onSceneReady={() => setCameraReady(true)}
      >
        {renderNode()} 
      </VRSceneWrapper>
    </Box>
  );
}

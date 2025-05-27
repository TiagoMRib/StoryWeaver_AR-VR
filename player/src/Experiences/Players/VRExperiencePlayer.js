import React, { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import BeginNodeDisplay from "../NodesDisplay/BeginNodeDisplay";
import EndNodeDisplay from "../NodesDisplay/EndNodeDisplay";
import QuizNodeDisplay from "../NodesDisplay/QuizNodeDisplay";
import DialogueNodeDisplay from "../NodesDisplay/DialogueNodeDisplay";
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

  const handleSceneLoaded = (scene) => {
    setSceneEl(scene);
  };

  const resolveNextNode = (fromNode, choiceIndex = null) => {
    if (fromNode.action === "choice" && choiceIndex !== null) {
      const goToId = fromNode.data.options[choiceIndex].goToStep;
      return story.find(n => n.id === goToId);
    }
    return story.find(n => n.id === fromNode.goToStep);
  };

  const handleAdvance = (choiceIndex = null) => {
    if (currentNode?.action === "end") {
      console.log("[VR Advance] Reached end node, exiting experience");
      setExperience?.(undefined);
      return;
    }

    const next = resolveNextNode(currentNode, choiceIndex);
    console.log("[VR Advance] Advancing from node:", currentNode.id, "to:", next ? next.id : "none");
    if (next) setCurrentNode(next);
  };

  const renderNode = () => {
    if (!currentNode) return null;

    console.log("[VR Render] Current node:", currentNode.id, "Action:", currentNode.action);
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
          />
        );
      case "dialogue":
        return (
          <DialogueNodeDisplay
            mode="vr"
            node={currentNode}
            setNextNode={handleAdvance}
          />
        );
      case "choice":
        return (
          <QuizNodeDisplay
            mode="vr"
            node={currentNode}
            onNext={handleAdvance}
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

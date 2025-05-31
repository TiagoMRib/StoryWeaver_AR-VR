import React, { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import BeginNodeDisplay from "../NodesDisplay/BeginNodeDisplay";
import EndNodeDisplay from "../NodesDisplay/EndNodeDisplay";
import QuizNodeDisplay from "../NodesDisplay/QuizNodeDisplay";
import TextNodeDisplay from "../NodesDisplay/TextNodeDisplay";
import VRSceneWrapper from "./VRSceneWrapper";

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

  const renderNode = () => {
    if (!currentNode) return null;

    if (currentNode.trigger && !hasTriggered) {
      return null;
    }

    // Skip begin-dialogue / end-dialogue immediately
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
        return (
          <Typography>
            Esta cena não é suportada no modo VR. ({currentNode.action})
          </Typography>
        );
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

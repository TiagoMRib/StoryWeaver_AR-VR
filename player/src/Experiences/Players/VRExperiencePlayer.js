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
  projectInfo,
  locations,
  characters,
  story,
  setNextNode,
  setExperience,
  repo,
}) {
  const [currentNode, setCurrentNode] = useState(null);
  const [hasTriggered, setHasTriggered] = useState(false);
  const [sceneEl, setSceneEl] = useState(null);
  const [cameraReady, setCameraReady] = useState(false);

  useEffect(() => {
    const beginNode = story.find((node) => node.action === "begin");
    if (beginNode) {
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
    const next = resolveNextNode(currentNode, choiceIndex);
    if (next) setCurrentNode(next);
  };

  const renderNode = () => {
    if (!currentNode) return null;

    switch (currentNode.action) {
      case "begin":
        return (
          <BeginNodeDisplay
            mode="vr"
            spawnPoint={projectInfo.vrPlayerStart}
            node={currentNode}
            onNext={handleAdvance}
            experienceName={projectInfo.experienceName}
          />
        );
      case "text":
        return (
          <TextNodeDisplay
            mode="vr"
            node={currentNode}
            setNextNode={handleAdvance}
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
          <DialogueNodeDisplay
            mode="vr"
            node={currentNode}
            setNextNode={handleAdvance}
          />
        );
      case "quiz":
        return (
          <QuizNodeDisplay
            mode="vr"
            node={currentNode}
            setNextNode={handleAdvance}
            experienceName={projectInfo.projectTitle}
          />
        );
      case "end":
        return (
          <EndNodeDisplay
            mode="vr"
            node={currentNode}
            experienceName={projectInfo.projectTitle}
            setNextNode={() => {
              repo?.markEndingObtained?.(
                projectInfo.id,
                currentNode.data.id,
                projectInfo.projectTitle,
                projectInfo.storyEndings
              )
              .then(() => setExperience(undefined))
              .catch(console.error);
            }}
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
        projectInfo={projectInfo}
        locations={locations}
        characters={characters}
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

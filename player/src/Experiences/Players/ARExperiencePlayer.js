import React, { useEffect, useState } from "react";
import { Box, ButtonBase, Typography } from "@mui/material";
import BeginNodeDisplay from "../NodesDisplay/BeginNodeDisplay";
import EndNodeDisplay from "../NodesDisplay/EndNodeDisplay";
import TextNodeDisplay from "../NodesDisplay/TextNodeDisplay";
import QuizNodeDisplay from "../NodesDisplay/QuizNodeDisplay";
import { useLocationCheck } from "../NodesDisplay/util/LocationCheck";

export default function ARExperiencePlayer({
  projectData,
  experienceName,
  locations,
  characters,
  interactions,
  story,
  setExperience,
  repo,
}) {
  const [currentNode, setCurrentNode] = useState(null);
  const [hasTriggered, setHasTriggered] = useState(false);

  useEffect(() => {
    const beginNode = story.find((node) => node.action === "begin");
    if (beginNode) {
      setCurrentNode(beginNode);
    }
  }, [story]);

  useEffect(() => {
    setHasTriggered(false);

    // Auto-advance for skipped types
    if (currentNode?.action === "begin-dialogue" || currentNode?.action === "end-dialogue") {
      const next = resolveNextNode(currentNode);
      if (next) setTimeout(() => setCurrentNode(next), 100); // slight delay for safety
    }
  }, [currentNode]);

  const gpsCoords =
    currentNode?.trigger?.interaction === "gps"
      ? locations.find((l) => l.name === currentNode.trigger.target)?.trigger_type
      : null;

  const distance = useLocationCheck(
    gpsCoords ? { lat: gpsCoords.lat, lng: gpsCoords.lng } : null,
    20,
    setHasTriggered
  );

  const resolveNextNode = (fromNode, choiceIndex = null) => {
    if (fromNode.action === "choice" && choiceIndex !== null) {
      const goToId = fromNode.data.options[choiceIndex].goToStep;
      return story.find(n => n.id === goToId);
    }
    return story.find(n => n.id === fromNode.goToStep);
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

    // Handle GPS-based waiting
    if (currentNode.trigger?.interaction === "gps" && !hasTriggered) {
      return (
        <Box sx={centerBox}>
          <Typography variant="h6">
            Dirija-se até: <strong>{currentNode.trigger.target}</strong>
          </Typography>
          {distance !== null && (
            <Typography sx={{ mt: 1 }}>
              Distância: {distance.toFixed(1)}m
            </Typography>
          )}
        </Box>
      );
    }

    switch (currentNode.action) {
      case "begin":
        return (
          <BeginNodeDisplay
            mode="ar"
            node={currentNode}
            onNext={handleAdvance}
            experienceName={experienceName}
          />
        );
      case "text":
        return (
          <TextNodeDisplay
            mode="ar"
            node={currentNode}
            onNext={handleAdvance}
            characters={characters}
          />
        );
      case "choice":
        return (
          <QuizNodeDisplay
            mode="ar"
            node={currentNode}
            onNext={handleAdvance}
            characters={characters}
          />
        );
      case "end":
        return (
          <EndNodeDisplay
            mode="ar"
            node={currentNode}
            onNext={() => setExperience(undefined)}
          />
        );
      case "begin-dialogue":
      case "end-dialogue":
        return null; // handled automatically in useEffect
      default:
        return (
          <Box sx={centerBox}>
            <Typography>
              Passo não suportado: {currentNode.action}
            </Typography>
            <ButtonBase sx={buttonStyle} onClick={() => setExperience(undefined)}>
              Sair
            </ButtonBase>
          </Box>
        );
    }
  };

  return (
    <Box sx={{ width: "100%", height: "100%" }}>
      {renderNode()}
    </Box>
  );
}

// UI Styles
const centerBox = {
  width: "100%",
  height: "100%",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  p: 3,
};

const buttonStyle = {
  backgroundColor: "#4caf50",
  color: "white",
  fontSize: "18px",
  p: 2,
  borderRadius: 3,
  m: 2,
};

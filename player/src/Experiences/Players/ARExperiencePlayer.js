import React, { useEffect, useState } from "react";
import { Box, ButtonBase, Typography } from "@mui/material";
import BeginNodeDisplay from "../NodesDisplay/BeginNodeDisplay";
import EndNodeDisplay from "../NodesDisplay/EndNodeDisplay";
import TextNodeDisplay from "../NodesDisplay/TextNodeDisplay";
import QuizNodeDisplay from "../NodesDisplay/QuizNodeDisplay";
import { useLocationCheck } from "../NodesDisplay/util/LocationCheck";

import ARCodeScanner from "../NodesDisplay/util/ARCodeScanner";
import GoToNextSlideButton from "../NodesDisplay/util/GoToNextSlideButton";

export default function ARExperiencePlayer({
  projectId,
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
  const [scannedEntity, setScannedEntity] = useState(null);

  // === Step 1: Start at 'begin' node
  useEffect(() => {
    const beginNode = story.find((node) => node.action === "begin");
    if (beginNode) setCurrentNode(beginNode);
  }, [story]);

  // === Step 2: Auto-advance through passive steps
  useEffect(() => {
    setHasTriggered(false);
    setScannedEntity(null); // reset QR trigger
  
    if (currentNode) {
      console.log(`[Node Entered] Action: ${currentNode.action}`);
      if (currentNode.trigger) {
        console.log(`[Trigger Check] Type: ${currentNode.trigger.interaction}, Target: ${currentNode.trigger.target}`);
      } else {
        console.log("[Trigger Check] No trigger for this node.");
      }
    }
  
    if (
      currentNode?.action === "begin-dialogue" ||
      currentNode?.action === "end-dialogue"
    ) {
      const next = resolveNextNode(currentNode);
      if (next) setTimeout(() => setCurrentNode(next), 100);
    }
  }, [currentNode]);

  // === Step 3: GPS trigger logic
  const gpsCoords =
    currentNode?.trigger?.interaction === "gps"
      ? locations.find((l) => l.name === currentNode.trigger.target)?.trigger_type
      : null;

  const distance = useLocationCheck(
    gpsCoords ? { lat: gpsCoords.lat, lng: gpsCoords.lng } : null,
    20,
    setHasTriggered
  );

  // === Step 4: QR/image trigger fallback (legacy event listener)
  useEffect(() => {
    const trigger = currentNode?.trigger;
    if (!trigger) return; // Early return if no trigger exists

    const interactionMethod = interactions.find(i => i.type === trigger?.interaction)?.methodAr;
    if (!interactionMethod || interactionMethod === "gps") return;

    const handleScanEvent = (event) => {
      const scannedValue = event.detail;
      console.log(`[AR Trigger] Detected value: ${scannedValue}, expecting: ${trigger.target}`);
      if (scannedValue === trigger.target) {
        setScannedEntity(scannedValue);
        setHasTriggered(true);
      }
    };

    const eventName =
      interactionMethod === "qr_code" ? "qr-scan" :
      interactionMethod === "image_tracking" ? "image-scan" :
      null;

    if (eventName) {
      window.addEventListener(eventName, handleScanEvent);
      return () => window.removeEventListener(eventName, handleScanEvent);
    }
  }, [currentNode]);

  // === Step 5: Advance once triggered
  useEffect(() => {
    if (!hasTriggered) return;
  
    console.log("[Trigger Success] Proceeding to next node...");
    const next = resolveNextNode(currentNode);
    if (next) setTimeout(() => setCurrentNode(next), 100);
  }, [hasTriggered]);

  // === Node transition logic
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

  // === Step 6: Main rendering logic
  const renderNode = () => {
    if (!currentNode) return null;
  
    const trigger = currentNode.trigger;
  
    const interactionMethod = trigger
      ? interactions.find(i => i.type === trigger.interaction)?.methodAr
      : null;

    console.log("[ARPlayer] interactionMethod:", interactionMethod);

    // commented gps to easier testing: "gps", 
    const isARTriggeredNode = trigger && ["gps", "qr_code", "image_tracking"].includes(interactionMethod);
    // === Show waiting instruction (e.g., GPS or QR) if not yet triggered
    if (isARTriggeredNode && !hasTriggered) {
      console.log("[ARPlayer] Waiting for trigger:", trigger);
  
      return (
        <Box sx={centerBox}>
          <Typography variant="h6">
            <strong>{interactionMethod.toUpperCase()}</strong> <strong>{trigger.target}</strong>
          </Typography>
  
          {interactionMethod === "gps" && (
            <Typography sx={{ mt: 1 }}>
              {distance !== null
                ? `Distância até o destino: ${distance.toFixed(1)}m`
                : "Localizando posição..."}
            </Typography>
          )}
  
          {interactionMethod === "qr_code" && (
            <>
              <Typography sx={{ mt: 1, fontStyle: "italic" }}>
                Aponte a câmara para o QR Code
              </Typography>
              <ARCodeScanner
                storyId={projectId}
                characters={characters}
                locations={locations}
                onTrigger={(entity) => {
                  console.log("[Scanner Triggered]", entity);
                  setScannedEntity(entity);
                  setHasTriggered(true);
                }}
              />
            </>
          )}
  
          {interactionMethod === "image_tracking" && (
            <Typography sx={{ mt: 1, fontStyle: "italic" }}>
              Mostre a imagem de tracking à câmara
            </Typography>
          )}
  
          {/* Show NEXT button but do nothing if clicked before triggered */}
          <GoToNextSlideButton
            currentNode={currentNode}
            onAdvance={() => {
              if (hasTriggered) handleAdvance();
            }}
          />
        </Box>
      );
    }
  
    // === If triggered, show actual content node
    switch (currentNode.action) {
      case "begin":
        return (
          <>
            <BeginNodeDisplay
              mode="ar"
              node={currentNode}
              onNext={handleAdvance}
              experienceName={experienceName}
            />
            <GoToNextSlideButton
              currentNode={currentNode}
              onAdvance={handleAdvance}
            />
          </>
        );
  
      case "text":
        return (
          <>
            <TextNodeDisplay
              mode="ar"
              node={currentNode}
              onNext={handleAdvance}
              characters={characters}
            />
            <GoToNextSlideButton
              currentNode={currentNode}
              onAdvance={handleAdvance}
            />
          </>
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
          <>
            <EndNodeDisplay
              mode="ar"
              node={currentNode}
              onNext={() => setExperience(undefined)}
            />
            <GoToNextSlideButton
              currentNode={currentNode}
              onAdvance={() => setExperience(undefined)}
            />
          </>
        );
  
      default:
        return (
          <Box sx={centerBox}>
            <Typography>Passo não suportado: {currentNode.action}</Typography>
            <GoToNextSlideButton
              currentNode={currentNode}
              onAdvance={() => setExperience(undefined)}
            />
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

// === Styles ===
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

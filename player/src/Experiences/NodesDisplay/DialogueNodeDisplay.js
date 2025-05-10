import React, { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import { backgroundColor as defaultBg, textColor } from "../../themes";
import { ApiDataRepository } from "../../api/ApiDataRepository";
import { DialogNodeType } from "../../models/DialogNodeTypes";
import Typewriter from "./util/TypeWriter";
import CharacterDialogueDisplay from "./util/CharacterDialogueDisplay";
import ChoiceDialogueDisplay from "./util/ChoiceDialogueDisplay";
import { useLocationCheck, getDirectionToDestination } from "./util/LocationCheck";
import { ComponentState } from "../../models/ComponentState";

export default function DialogueNodeDisplay({
  node: dialogueNode,
  possibleNextNodes,
  outGoingEdges,
  setNextNode,
  mode,
}) {
  const repo = ApiDataRepository.getInstance();
  const isSiteTriggered = dialogueNode.data.isSiteTriggered;
  const siteType = dialogueNode.data.site_type;

  const [isOnLocation, setIsOnLocation] = useState(!isSiteTriggered);
  const [direction, setDirection] = useState(null);
  const [componentState, setComponentState] = useState(ComponentState.LOADING);
  const [backgroundURL, setBackgroundURL] = useState("");
  const [backgroundColor, setBackgroundColor] = useState(defaultBg);
  const [currentDialogNode, setCurrentDialogNode] = useState(undefined);

  const dialogTree = dialogueNode.data.dialog;
  const dialogNodes = dialogTree.nodes;
  const dialogEdges = dialogTree.edges;

  const distance = useLocationCheck(
    isSiteTriggered ? siteType.map : null,
    isSiteTriggered ? siteType.place : null,
    10,
    setIsOnLocation
  );

  useEffect(() => {
    if (isSiteTriggered && siteType.map) {
      getDirectionToDestination(siteType.map.lat, siteType.map.lng, setDirection);
    }
  }, [isSiteTriggered, siteType]);

  useEffect(() => {
    const beginNode = dialogNodes.find((node) => node.type === DialogNodeType.beginDialogNode);
    console.log("[DialogueNodeDisplay] DIALOG BEGIN NODE:", beginNode);
    setCurrentDialogNode(findNextDialogueNode(beginNode));
    setComponentState(ComponentState.LOADED);
  }, [dialogTree]);

  useEffect(() => {
    const bg = dialogueNode.data.background;
    if (bg.inputType === "color") {
      setBackgroundColor(bg.color);
      setBackgroundURL("");
    } else if (bg.inputType === "url") {
      setBackgroundURL(bg.filename);
    } else if (bg.filename !== "") {
      repo.getFilePath(bg.filename).then(setBackgroundURL).catch(() => setBackgroundURL(""));
    }
  }, [dialogueNode]);

const findNextDialogueNode = (dialogNode, choice) => {
  console.log("[findNextDialogueNode] Finding next from:", dialogNode.id, "choice:", choice);

  const edgesFromCurrent = dialogEdges.filter((edge) => edge.source === dialogNode.id);
  console.log("[findNextDialogueNode] Candidate edges:", edgesFromCurrent);

  const edge = edgesFromCurrent.find((edge) =>
    choice !== undefined
      ? edge.sourceHandle == choice // == to allow string/number match
      : true
  );

  if (!edge) {
    console.warn("[findNextDialogueNode] No edge found from:", dialogNode.id, "with choice:", choice);
    return undefined;
  }

  const nextNode = dialogNodes.find((n) => n.id === edge.target);
  console.log("[findNextDialogueNode] Next node resolved to:", nextNode);
  return nextNode;
};

  const renderDialogNode = () => {
    if (!currentDialogNode) return null;

    switch (currentDialogNode.type) {
      case DialogNodeType.beginDialogNode:
        return null;

      case DialogNodeType.dialogNode:
        return (
          <CharacterDialogueDisplay
            mode={mode}
            character={currentDialogNode.data.character}
            dialogue={currentDialogNode.data.text}
            audioSrc={currentDialogNode.data.audio}
            setNextDialogueNode={() => {
              const next = findNextDialogueNode(currentDialogNode);
              setCurrentDialogNode(next);
            }}
          />
        );

      case DialogNodeType.dialogChoiceNode:
        return (
          <ChoiceDialogueDisplay
            mode={mode}
            character={currentDialogNode.data.character}
            prompt={currentDialogNode.data.prompt}
            answers={currentDialogNode.data.answers}
            audioSrc={currentDialogNode.data.audio}
            setNextDialogueNode={(choice) => {
              const next = findNextDialogueNode(currentDialogNode, choice);
              setCurrentDialogNode(next);
            }}
          />
        );

      case DialogNodeType.endDialogNode: {
        const handleId = currentDialogNode.data.id;
        console.log("[DialogueNodeDisplay] Reached endDialogNode:", handleId);

        const edge = outGoingEdges.find((edge) => edge.sourceHandle === handleId);
        console.log("[DialogueNodeDisplay] End node edge:", edge);
        console.log("[DialogueNodeDisplay] possibleNextNodes:", possibleNextNodes);

        if (!edge) {
          console.warn("[DialogueNodeDisplay] No edge found from dialog end node with handle:", handleId);
          return null;
        }

        const next = possibleNextNodes.find((node) => node.id === edge.target);
        if (!next) {
          console.warn("[DialogueNodeDisplay] No next node found in possibleNextNodes for target:", edge.target);
          return null;
        }

        setNextNode(next);
        return null;
}

      default:
        return null;
    }
  };

  if (componentState === ComponentState.LOADING) {
    return (
      <Box sx={{ width: "100%", height: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <Typography variant="h4">Carregando...</Typography>
      </Box>
    );
  }

  if (componentState === ComponentState.ERROR) {
    return (
      <Box sx={{ width: "100%", height: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <Typography variant="h4">Erro ao carregar</Typography>
      </Box>
    );
  }

  if (!isOnLocation) {
    return (
      <Box sx={{ width: "100%", height: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <Typography variant="h4" sx={{ textAlign: "center", px: 2 }}>
          Continua em <strong>{siteType.place}</strong>. <br />
          {distance !== null ? (
            <>
              Está a <strong>{distance.toFixed(2)}</strong> metros do local. <br />
              {direction ? `Siga para ${direction}.` : "Calculando direção..."}
            </>
          ) : (
            "Calculando distância..."
          )}
        </Typography>
      </Box>
    );
  }

  // === VR mode ===
  if (mode === "vr") {
    return (
      <a-entity id="dialog-panel-wrapper">
        {/* Optional future wrapper for background plane */}
        {renderDialogNode()}
      </a-entity>
    );
  }

  // === AR or screen ===
  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "91vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        background:
          backgroundURL === ""
            ? backgroundColor
            : `${backgroundColor} url(${backgroundURL}) no-repeat center center fixed`,
        backgroundSize: "cover",
      }}
    >
      {renderDialogNode()}
    </Box>
  );
}

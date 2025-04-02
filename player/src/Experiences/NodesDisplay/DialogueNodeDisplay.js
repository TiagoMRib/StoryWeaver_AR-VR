import {
  Box,
  ButtonBase,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { backgroundColor, secondaryColor, textColor } from "../../themes";
import { ApiDataRepository } from "../../api/ApiDataRepository";
import { DialogNodeType } from "../../models/DialogNodeTypes";
import Typewriter from "./util/TypeWriter";
import CharacterDialogueDisplay from "./util/CharacterDialogueDisplay";
import { useLocationCheck, getDirectionToDestination } from "./util/LocationCheck";
import { ComponentState } from "../../models/ComponentState";
import ChoiceDialogueDisplay from "./util/ChoiceDialogueDisplay";

export default function DialogueNodeDisplay(props) {
  const repo = ApiDataRepository.getInstance();
  const dialogueNode = props.node;
  const possibleNextNodes = props.possibleNextNodes;
  const outGoingEdges = props.outGoingEdges;

  // Location based section
  const isSiteTriggered = dialogueNode.data.isSiteTriggered;
  const siteType = dialogueNode.data.site_type; // Contains map & place
  const [isOnLocation, setIsOnLocation] = useState(!isSiteTriggered); // Default true if not site-triggered
  const [direction, setDirection] = useState(null);

  // Call location check if site-triggered
  if (isSiteTriggered) {
    console.log("Site coordinates: ", siteType);
  }
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
  

  const backgroundFileInfo = dialogueNode.data.background;
  const dialogTree = dialogueNode.data.dialog;
  const dialogNodes = dialogTree.nodes;
  const dialogEdges = dialogTree.edges;
  console.log(dialogNodes);
  console.log(dialogEdges);
  const setNextNode = props.setNextNode;

  const [componentState, setComponentState] = React.useState(
    ComponentState.LOADING
  );
  const [backgroundURL, setBackgroundURL] = React.useState("");

  const [currentDialogNode, setCurrentDialogNode] = React.useState(undefined);

  console.log(currentDialogNode);
  const findNextDialogueNode = (dialogNode, choice) => {
    console.log(choice);
    const edgesFromCurrentNode = dialogEdges.find((edge) => {
      if (choice != undefined) {
        return edge.source == dialogNode.id && edge.sourceHandle == choice;
      } else {
        return edge.source == dialogNode.id;
      }
    });

    console.log(edgesFromCurrentNode);
    if (edgesFromCurrentNode.length == 0) {
      return undefined;
    }
    const nextNode = dialogNodes.find(
      (node) => node.id == edgesFromCurrentNode.target
    );
    console.log("nextNode: ", nextNode);
    return nextNode;
  };

  useEffect(() => {
    const beginNode = dialogNodes.find(
      (node) => node.type == DialogNodeType.beginDialogNode
    );
    setCurrentDialogNode(findNextDialogueNode(beginNode));
    setComponentState(ComponentState.LOADED);
  }, [dialogTree]);

  const [backgroundColor, setBackgroundColor] = React.useState("#A9B388");

  useEffect(() => {
    if (backgroundFileInfo.inputType == "color") {
      setBackgroundColor(backgroundFileInfo.color);
      setBackgroundURL("");
      return;
    }
    if (backgroundFileInfo.filename == "") {
      setBackgroundURL("");
      return;
    }
    if (backgroundFileInfo.inputType == "url") {
      setBackgroundURL(backgroundFileInfo.filename);
    } else {
      repo
        .getFilePath(backgroundFileInfo.filename)
        .then((url) => {
          setBackgroundURL(url);
        })
        .catch(() => {
          setBackgroundURL("");
        });
    }
  }, [backgroundFileInfo]);

  return componentState == ComponentState.LOADING ? (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Typography variant="h4">Carregando...</Typography>
    </Box>
  ) : componentState == ComponentState.ERROR ? (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Typography variant="h4">Erro ao carregar</Typography>
    </Box>
  ) : !isOnLocation ? ( // BLOCK THE STORY UNTIL USER REACHES LOCATION
    <Box
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
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
  ) : (
    <Box
      sx={{
        width: "100%",
        minHeight: "91vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        background:
          backgroundURL == ""
            ? backgroundColor
            : `${backgroundColor} url(${backgroundURL}) no-repeat center center  fixed`,
        backgroundSize: "cover",
      }}
    >
      {currentDialogNode.type == DialogNodeType.beginDialogNode ? null : 
       currentDialogNode.type == DialogNodeType.dialogNode ? (
        <CharacterDialogueDisplay
          character={currentDialogNode.data.character}
          dialogue={currentDialogNode.data.text}
          audioSrc={currentDialogNode.data.audio}
          setNextDialogueNode={() => {
            const nextNode = findNextDialogueNode(currentDialogNode);
            setCurrentDialogNode(nextNode);
          }}
        />
      ) : currentDialogNode.type == DialogNodeType.dialogChoiceNode ? (
        <ChoiceDialogueDisplay
          character={currentDialogNode.data.character}
          prompt={currentDialogNode.data.prompt}
          answers={currentDialogNode.data.answers}
          audioSrc={currentDialogNode.data.audio}
          setNextDialogueNode={(choice) => {
            const nextNode = findNextDialogueNode(currentDialogNode, choice);
            setCurrentDialogNode(nextNode);
          }}
        />
      ) : currentDialogNode.type == DialogNodeType.endDialogNode ? (
        setNextNode(
          possibleNextNodes.find(
            (node) =>
              node.id ==
              outGoingEdges.find(
                (edge) => edge.sourceHandle == currentDialogNode.data.id
              ).target
          )
        )
      ) : null}
    </Box>
  );
}

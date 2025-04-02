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
import PlayerTextFinalDisplay from "./util/PlayerTextFinalDisplay";
import Typewriter from "./util/TypeWriter";
import { useLocationCheck, getDirectionToDestination } from "./util/LocationCheck";

export default function QuizNodeDisplay(props) {
  const repo = ApiDataRepository.getInstance();
  const quizNode = props.node;
  const question = quizNode.data.question;
  const answers = quizNode.data.answers;
  const outGoingEdges = props.outGoingEdges;

  const possibleNextNodes = props.possibleNextNodes;

  const backgroundFileInfo = quizNode.data.background;

  const character = quizNode.data.character;

  const [backgroundURL, setBackgroundURL] = React.useState("");

  const setNextNode = props.setNextNode;
  const experienceName = props.experienceName;

  const [backgroundColor, setBackgroundColor] = React.useState("#A9B388");

  const [characterImg, setCharacterImg] = React.useState("");

  // Location based section
    const isSiteTriggered = quizNode.data.isSiteTriggered;
    const siteType = quizNode.data.site_type; // Contains map & place
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
    if (character.image.filename == "") {
      return;
    }
    if (character.image.inputType == "url") {
      setCharacterImg(character.image.filename);
    } else {
      repo.getFilePath(character.image.filename).then((url) => {
        setCharacterImg(url);
      });
    }
  }, [character]);

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

  return !isOnLocation ? ( // BLOCK THE STORY UNTIL USER REACHES LOCATION
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
        height: "91vh",
        overflowY: "auto !important",
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
      {question == "" ? null : (
        <>
          <img
            src={characterImg}
            alt={character.name}
            style={{
              width: "100px",
              height: "100px",
              borderRadius: "50%",
              border: "2px solid black",
            }}
          />
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "white",
              border: "2px solid black",
              borderRadius: "5px",
            }}
          >
            <Typography
              variant="h6"
              sx={{
                px: 3,
                py: 1,
                fontSize: 20,
                color: "black",
                fontWeight: 200,
                whiteSpace: "pre-wrap",
              }}
            >
              <Typewriter text={question} delay={100} />
            </Typography>
          </Box>
        </>
      )}
      <Box
        sx={{
          pb: 9,
        }}
      >
        {answers.map((answer, index) => (
          <ButtonBase
            key={index}
            sx={{
              mb: 2,
              width: "90%",
              color: textColor,
            }}
            onClick={() => {
              console.log(possibleNextNodes);
              setNextNode(
                possibleNextNodes.find(
                  (node) =>
                    node.id ==
                    outGoingEdges.find(
                      (edge) => edge.sourceHandle == index.toString()
                    ).target
                )
              );
            }}
          >
            <PlayerTextFinalDisplay
              text={answer}
              messageType={"Opção " + (index + 1)}
              style={{ width: "90%" }}
            ></PlayerTextFinalDisplay>
          </ButtonBase>
        ))}
      </Box>
    </Box>
  );
}

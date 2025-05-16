import {
  Box,
  ButtonBase,
  Typography
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { backgroundColor as defaultBg, textColor } from "../../themes";
import { ApiDataRepository } from "../../api/ApiDataRepository";
import PlayerTextFinalDisplay from "./util/PlayerTextFinalDisplay";
import Typewriter from "./util/TypeWriter";

export default function QuizNodeDisplay({
  node,
  possibleNextNodes,
  setNextNode,
  outGoingEdges,
  mode,
  experienceName,
  hasTriggered
}) {
  const repo = ApiDataRepository.getInstance();
  const quizNode = node;
  const question = quizNode.data.question;
  const answers = quizNode.data.answers;
  const backgroundFileInfo = quizNode.data.background;
  const character = quizNode.data.character;

  const [backgroundURL, setBackgroundURL] = useState("");
  const [bgColor, setBgColor] = useState("#A9B388");
  const [characterImg, setCharacterImg] = useState("");

  // Load character image
  useEffect(() => {
    if (!character || !character.image) return;

    if (character.image.inputType === "url") {
      setCharacterImg(character.image.filename);
    } else if (character.image.filename !== "") {
      repo.getFilePath(character.image.filename).then(setCharacterImg);
    }
  }, [character]);

  // Load background
  useEffect(() => {
    if (!backgroundFileInfo) return;

    if (backgroundFileInfo.inputType === "color") {
      setBgColor(backgroundFileInfo.color);
      setBackgroundURL("");
    } else if (backgroundFileInfo.inputType === "url") {
      setBackgroundURL(backgroundFileInfo.filename);
    } else if (backgroundFileInfo.filename !== "") {
      repo.getFilePath(backgroundFileInfo.filename).then(setBackgroundURL).catch(() => setBackgroundURL(""));
    }
  }, [backgroundFileInfo]);

  
  const { vr, vr_type } = node.data || {};
  const isVRTriggered = vr && vr_type?.trigger_mode;
  const isBlockedInVR = mode === "vr" && isVRTriggered && !hasTriggered;

  if (isBlockedInVR) {
    return (
      <a-entity>
        <a-text
          value="Interage com um objeto ou vá até o local para continuar"
          color="white"
          align="center"
          position="0 1.6 -2"
        ></a-text>
      </a-entity>
    );
  }

  if (mode === "vr") {
    return (
      <a-entity id="quiz-panel-wrapper">
        <a-plane
          position="0 1.6 -2"
          width="3.8"
          height="2.6"
          color="white"
          material="opacity: 0.95; side: double"
        >
          <a-text
            value={question}
            wrap-count="35"
            color="black"
            align="center"
            position="0 1.1 0.01"
          ></a-text>

          {answers.map((answer, index) => {
            const yOffset = 0.6 - index * 0.6;
            const targetId = outGoingEdges.find(e => e.sourceHandle === index.toString())?.target;
            const targetNode = possibleNextNodes.find(n => n.id === targetId);

            return (
              <a-box
                key={index}
                position={`0 ${yOffset} 0.01`}
                width="3"
                height="0.5"
                color="#2196F3"
                class="clickable"
                onclick={() => targetNode && setNextNode(targetNode)}
              >
                <a-text
                  value={answer}
                  color="white"
                  align="center"
                  position="0 0 0.05"
                />
              </a-box>
            );
          })}
        </a-plane>
      </a-entity>
    );
  }

  // Default: AR or screen mode
  return (
    <Box
      sx={{
        width: "100%",
        height: "91vh",
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        background:
          backgroundURL === ""
            ? bgColor
            : `${bgColor} url(${backgroundURL}) no-repeat center center fixed`,
        backgroundSize: "cover",
      }}
    >
      {question && (
        <>
          {characterImg && (
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
          )}
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "white",
              border: "2px solid black",
              borderRadius: "5px",
              px: 3,
              py: 1,
            }}
          >
            <Typography
              variant="h6"
              sx={{
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
      <Box sx={{ pb: 9 }}>
        {answers.map((answer, index) => (
          <ButtonBase
            key={index}
            sx={{ mb: 2, width: "90%", color: textColor }}
            onClick={() => {
              const edge = outGoingEdges.find(
                (edge) => edge.sourceHandle === index.toString()
              );
              const nextNode = possibleNextNodes.find((n) => n.id === edge?.target);
              if (nextNode) setNextNode(nextNode);
            }}
          >
            <PlayerTextFinalDisplay
              text={answer}
              messageType={`Opção ${index + 1}`}
              style={{ width: "90%" }}
            />
          </ButtonBase>
        ))}
      </Box>
    </Box>
  );
}

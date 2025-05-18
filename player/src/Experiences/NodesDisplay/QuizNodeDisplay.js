import React, { useEffect, useState } from "react";
import * as THREE from "three";
import { Box, ButtonBase, Typography } from "@mui/material";
import { ApiDataRepository } from "../../api/ApiDataRepository";
import PlayerTextFinalDisplay from "./util/PlayerTextFinalDisplay";
import Typewriter from "./util/TypeWriter";
import { textColor } from "../../themes";

export default function QuizNodeDisplay({
  node,
  possibleNextNodes,
  setNextNode,
  outGoingEdges,
  mode,
  experienceName,
}) {
  const repo = ApiDataRepository.getInstance();
  const question = node.data.question;
  const answers = node.data.answers;
  const backgroundFileInfo = node.data.background;
  const character = node.data.character;

  const [backgroundURL, setBackgroundURL] = useState("");
  const [bgColor, setBgColor] = useState("#A9B388");
  const [characterImg, setCharacterImg] = useState("");

  // Load character image
  useEffect(() => {
    if (!character?.image?.filename) return;
    if (character.image.inputType === "url") {
      setCharacterImg(character.image.filename);
    } else {
      repo.getFilePath(character.image.filename).then(setCharacterImg).catch(() => {});
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
      repo.getFilePath(backgroundFileInfo.filename).then(setBackgroundURL).catch(() => {});
    }
  }, [backgroundFileInfo]);

  // === VR positioning logic ===
  useEffect(() => {
    if (mode !== "vr") return;

    setTimeout(() => {
      const scene = document.querySelector("a-scene");
      const camEl = scene?.querySelector("[camera]");
      const panelEl = scene?.querySelector("#quiz-panel-wrapper");

      if (!camEl || !panelEl) return;

      const camObj = camEl.object3D;
      const panelObj = panelEl.object3D;

      const charName = character?.name;
      const characterEl = scene.querySelector(`[id="${charName}"]`);
      const distance = 2.5;

      let targetPos = new THREE.Vector3();
      let lookAtPos = new THREE.Vector3();

      if (characterEl && characterEl.object3D) {
        const charObj = characterEl.object3D;
        charObj.getWorldPosition(targetPos);

        const forward = new THREE.Vector3();
        charObj.getWorldDirection(forward);
        targetPos.add(forward.multiplyScalar(1.5));
        lookAtPos.copy(charObj.position);

        console.log("[QuizNodeDisplay] Panel near character:", charName);
      } else {
        camObj.getWorldPosition(lookAtPos);
        const forward = new THREE.Vector3();
        camObj.getWorldDirection(forward);
        targetPos.copy(lookAtPos.clone().add(forward.multiplyScalar(-distance)));

        console.warn("[QuizNodeDisplay] Character not found, defaulting to camera");
      }

      panelObj.position.copy(targetPos);
      panelObj.lookAt(lookAtPos);
    }, 0);
  }, [mode, character]);

  // === VR rendering ===
  if (mode === "vr") {
    return (
      <a-entity id="quiz-panel-wrapper">
        {characterImg && (
          <a-image
            src={characterImg}
            position="-1 0.6 0"
            width="0.8"
            height="0.8"
            material="shader: flat"
          ></a-image>
        )}

        <a-plane
          width="3"
          height="1.2"
          color="white"
          material="side: double"
          position="0 0.3 0"
        >
          <a-text
            value={question}
            wrap-count="40"
            color="black"
            align="center"
            position="0 0 0.01"
          ></a-text>
        </a-plane>

        {answers.map((answer, index) => {
          const yOffset = -0.6 - index * 0.5;
          const targetId = outGoingEdges.find(e => e.sourceHandle === index.toString())?.target;
          const targetNode = possibleNextNodes.find(n => n.id === targetId);

          return (
            <a-box
              key={index}
              position={`0 ${yOffset} 0.01`}
              width="2.5"
              height="0.4"
              depth="0.05"
              color="#4caf50"
              class="clickable"
              onClick={() => {
                console.log(`[Quiz] Answer ${index + 1} selected: ${answer}`);
                if (targetNode) setNextNode(targetNode);
              }}
            >
              <a-text
                value={answer}
                align="center"
                color="white"
                position="0 0 0.05"
                wrap-count="30"
              ></a-text>
            </a-box>
          );
        })}
      </a-entity>
    );
  }

  // === AR / Screen rendering ===
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
      {characterImg && (
        <img
          src={characterImg}
          alt={character?.name}
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

      <Box sx={{ pb: 9 }}>
        {answers.map((answer, index) => {
          const edge = outGoingEdges.find(e => e.sourceHandle === index.toString());
          const nextNode = possibleNextNodes.find(n => n.id === edge?.target);

          return (
            <ButtonBase
              key={index}
              sx={{ mb: 2, width: "90%", color: textColor }}
              onClick={() => {
                if (nextNode) setNextNode(nextNode);
              }}
            >
              <PlayerTextFinalDisplay
                text={answer}
                messageType={`Opção ${index + 1}`}
                style={{ width: "90%" }}
              />
            </ButtonBase>
          );
        })}
      </Box>
    </Box>
  );
}

import React, { useEffect, useState } from "react";
import * as THREE from "three";
import { Box, ButtonBase, Typography } from "@mui/material";
import { ApiDataRepository } from "../../api/ApiDataRepository";
import VRCharacterPanel from "./util/VRCharacterPanel";
import PlayerTextFinalDisplay from "./util/PlayerTextFinalDisplay";
import Typewriter from "./util/TypeWriter";
import { textColor } from "../../themes";

export default function QuizNodeDisplay({
  node,
  onNext,
  characters,
  mode,
}) {
  const repo = ApiDataRepository.getInstance();
  const question = node.data.text;
  const answers = node.data.options;
  const backgroundFileInfo = node.data.background;
  const character = node.actor;

  const [backgroundURL, setBackgroundURL] = useState("");
  const [bgColor, setBgColor] = useState("#A9B388");
  const [characterImg, setCharacterImg] = useState("");

  console.log("[QuizNodeDisplay] Rendering Quiz Node:", node);

  // Load character image
  useEffect(() => {
    if (!character) return;

    const fullCharacter = characters.find(c => c.id === character.id || c.name === character.name);

    if (!fullCharacter?.image?.filename) return;

    if (fullCharacter.image.inputType === "url") {
      setCharacterImg(fullCharacter.image.filename);
    } else if (fullCharacter.image.blob) {
      // Use already loaded blob (editor may have injected it)
      setCharacterImg(fullCharacter.image.blob);
    } else {
      // Load from backend if not preloaded
      repo
        .getFile(fullCharacter.image.filename)
        .then((blob) => {
          const objectUrl = URL.createObjectURL(blob);
          setCharacterImg(objectUrl);
        })
        .catch(() => {});
    }
  }, [character, characters, repo]);

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

      const fullCharacter = characters.find(c => c.id === character.id || c.name === character.name);

      const characterEl = scene.querySelector(`[id="${fullCharacter.threeDObject}"]`);
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

        console.log("[QuizNodeDisplay] Panel near character:", fullCharacter.threeDObject);
      } else {
        camObj.getWorldPosition(lookAtPos);
        const forward = new THREE.Vector3();
        camObj.getWorldDirection(forward);
        targetPos.copy(lookAtPos.clone().add(forward.multiplyScalar(-distance)));

        console.warn("[QuizNodeDisplay] Character not found, defaulting to camera");
      }

      targetPos.y = Math.max(targetPos.y, 1.2);
      panelObj.position.copy(targetPos);
      panelObj.lookAt(lookAtPos);
    }, 0);
  }, [mode, character]);

  // === VR rendering ===
  if (mode === "vr") {
    return (
      <VRCharacterPanel
        id="quiz-panel-wrapper"
        characterImg={characterImg}
        characterName={character?.name}
        panelText={question}
        buttonElements={
          <>
            {answers.map((answer, index) => {
              const yOffset = -0.6 - index * 0.5;
              return (
                <a-box
                  key={index}
                  position={`0 ${yOffset} 0.01`}
                  width="2.5"
                  height="0.4"
                  depth="0.05"
                  color="#4caf50"
                  class="clickable"
                  onClick={() => onNext?.(index)}
                >
                  <a-text
                    value={answer.label}
                    align="center"
                    color="white"
                    position="0 0 0.05"
                    wrap-count="30"
                  ></a-text>
                </a-box>
              );
            })}
          </>
        }
      />
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

          return (
            <ButtonBase
              key={index}
              sx={{ mb: 2, width: "90%", color: textColor }}
              onClick={() => {
                onNext?.(index);
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

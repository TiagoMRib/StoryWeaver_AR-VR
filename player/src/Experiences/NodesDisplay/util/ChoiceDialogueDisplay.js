import React, { useEffect, useState } from "react";
import { Box, Typography, IconButton, Icon, ButtonBase } from "@mui/material";
import { ApiDataRepository } from "../../../api/ApiDataRepository";
import Typewriter from "./TypeWriter";
import AudioPlayIcon from "./AudioPlayIcon";
import PlayerTextFinalDisplay from "./PlayerTextFinalDisplay";
import {
  primaryColor,
  secondaryColor,
  textColor,
} from "../../../themes";
import * as THREE from "three";

export default function ChoiceDialogueDisplay({
  character,
  prompt,
  answers,
  audioSrc: audio,
  setNextDialogueNode,
  mode,
}) {
  const repo = ApiDataRepository.getInstance();
  const [characterImg, setCharacterImg] = useState("");
  const [displayAnswers, setDisplayAnswers] = useState(false);
  const [audioSrc, setAudioSrc] = useState(undefined);
  const [audioPlaying, setAudioPlaying] = useState(true);

  // Load audio
  useEffect(() => {
    if (!audio?.filename) return;
    if (audio.inputType === "url") {
      setAudioSrc(new Audio(audio.filename));
    } else {
      repo.getFilePath(audio.filename).then((url) => {
        setAudioSrc(new Audio(url));
      });
    }
  }, [audio]);

  useEffect(() => {
    if (!audioSrc) return;
    audioSrc.play();
    const onEnd = () => setAudioPlaying(false);
    audioSrc.addEventListener("ended", onEnd);
    return () => audioSrc.removeEventListener("ended", onEnd);
  }, [audioSrc]);

  useEffect(() => {
    if (!audioSrc) return;
    audioPlaying ? audioSrc.play() : audioSrc.pause();
  }, [audioPlaying]);

  // Load character image
  useEffect(() => {
    if (!character?.image?.filename) return;
    if (character.image.inputType === "url") {
      setCharacterImg(character.image.filename);
    } else {
      repo.getFilePath(character.image.filename)
        .then(setCharacterImg)
        .catch(() => setCharacterImg(""));
    }
  }, [character]);

  // === VR Positioning ===
  useEffect(() => {
    if (mode !== "vr") return;

    setTimeout(() => {
      const scene = document.querySelector("a-scene");
      const camEl = scene?.querySelector("[camera]");
      const panelEl = scene?.querySelector("#choice-dialogue-panel");

      if (!camEl || !panelEl) {
        console.warn("[ChoiceDialogueDisplay] Camera or panel not found");
        return;
      }

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

        console.log("[ChoiceDialogueDisplay] Panel near character:", charName);
      } else {
        camObj.getWorldPosition(lookAtPos);
        const forward = new THREE.Vector3();
        camObj.getWorldDirection(forward);
        targetPos.copy(lookAtPos.clone().add(forward.multiplyScalar(-distance)));

        console.warn("[ChoiceDialogueDisplay] Character not found, defaulting to camera");
      }

      panelObj.position.copy(targetPos);
      panelObj.lookAt(lookAtPos);
    }, 0);
  }, [mode, character]);

  // === VR rendering ===
  if (mode === "vr") {
    return (
      <a-entity id="choice-dialogue-panel">
        {/* Character image (optional) */}
        {characterImg && (
          <a-image
            src={characterImg}
            position="-1 0.6 0"
            width="0.8"
            height="0.8"
            material="shader: flat"
          ></a-image>
        )}

        {/* Prompt panel */}
        <a-plane
          width="3"
          height="1.2"
          color="white"
          material="side: double"
          position="0 0.3 0"
        >
          <a-text
            value={prompt}
            wrap-count="40"
            color="black"
            align="center"
            position="0 0 0.01"
          ></a-text>
        </a-plane>

        {/* Answer buttons */}
        {answers.map((answer, index) => (
          <a-box
            key={index}
            position={`0 ${-0.6 - index * 0.5} 0.01`}
            width="2.5"
            height="0.4"
            depth="0.05"
            color="#4caf50"
            class="clickable"
            onClick={() => {
              console.log(`[Choice] Choice selected: ${answer}`);
              if (audioSrc) audioSrc.pause();
              setNextDialogueNode(index);
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
        ))}
      </a-entity>
    );
  }

  // === Default screen/AR version ===
  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {audioSrc && (
        <AudioPlayIcon isPlaying={audioPlaying} setIsPlaying={setAudioPlaying} />
      )}

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
          width: "70%",
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
          <Typewriter
            text={prompt}
            delay={100}
            skipToEnd={displayAnswers}
            onComplete={() => setDisplayAnswers(true)}
          />
        </Typography>
      </Box>

      <Box
        sx={{
          display: displayAnswers ? "flex" : "none",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          width: "70%",
          pb: 10,
        }}
      >
        {answers.map((answer, index) => (
          <ButtonBase
            key={index}
            sx={{ width: "100%", cursor: "pointer" }}
            onClick={() => {
              if (audioSrc) audioSrc.pause();
              setNextDialogueNode(index);
            }}
          >
            <PlayerTextFinalDisplay
              style={{ width: "100%" }}
              text={answer}
              messageType="Resposta"
            />
          </ButtonBase>
        ))}
      </Box>
    </Box>
  );
}

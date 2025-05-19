import React, { useEffect, useState } from "react";
import { Box, Typography, IconButton, Icon } from "@mui/material";
import { ApiDataRepository } from "../../../api/ApiDataRepository";
import Typewriter from "./TypeWriter";
import AudioPlayIcon from "./AudioPlayIcon";
import { primaryColor, secondaryColor } from "../../../themes";
import * as THREE from "three";

export default function CharacterDialogueDisplay({
  character,
  dialogue,
  audioSrc: audio,
  setNextDialogueNode,
  mode = "ar",
}) {
  const repo = ApiDataRepository.getInstance();
  const [characterImg, setCharacterImg] = useState("");
  const [audioSrc, setAudioSrc] = useState(undefined);
  const [audioPlaying, setAudioPlaying] = useState(true);
  const [skipToEnd, setSkipToEnd] = useState(false);

  // Load character image
  useEffect(() => {
    if (!character?.image?.filename) return;

    if (character.image.inputType === "url") {
      setCharacterImg(character.image.filename);
    } else {
      repo.getFilePath(character.image.filename)
        .then(setCharacterImg)
        .catch((err) => {
          console.warn("[CharacterDialogueDisplay] Failed to load character image:", err);
          setCharacterImg(""); // Fallback: no image
        });
    }
}, [character]);

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

  // Handle audio playback
  useEffect(() => {
    if (!audioSrc) return;
    audioSrc.play();

    const onEnd = () => {
      setAudioPlaying(false);
      if (skipToEnd) setNextDialogueNode();
    };

    audioSrc.addEventListener("ended", onEnd);
    return () => audioSrc.removeEventListener("ended", onEnd);
  }, [audioSrc]);

  useEffect(() => {
    if (!audioSrc) return;
    audioPlaying ? audioSrc.play() : audioSrc.pause();
  }, [audioPlaying]);

  // === VR mode rendering ===
  useEffect(() => {
    if (mode !== "vr") return;

    const buttonEl = document.querySelector("#vr-dialogue-next");
    if (!buttonEl) return;

    const handleClick = () => {
      console.log("[VR] Avançar clicked");
      if (audioSrc) audioSrc.pause();
      setNextDialogueNode();
    };

    buttonEl.addEventListener("click", handleClick);
    return () => buttonEl.removeEventListener("click", handleClick);
  }, [mode, audioSrc, setNextDialogueNode]);

  useEffect(() => {
  if (mode !== "vr") return;

  setTimeout(() => {
    const scene = document.querySelector("a-scene");
    const camEl = scene?.querySelector("[camera]");
    const panelEl = scene?.querySelector("#character-dialogue-panel");

    if (!camEl || !panelEl) {
      console.warn("[CharacterDialogueDisplay] Camera or panel not found");
      return;
    }

    const camObj = camEl.object3D;
    const panelObj = panelEl.object3D;

    const charName = character?.name;
    console.log("[CharacterDialogueDisplay] Looking for character:", charName);

    let characterObj = null;
    scene?.object3D?.traverse((child) => {
      if (child.name === charName) {
        characterObj = child;
      }
    });
    const distance = 2.5;

    let targetPos = new THREE.Vector3();
    let lookAtPos = new THREE.Vector3();

    if (characterObj) {
      characterObj.getWorldPosition(targetPos);

      const forward = new THREE.Vector3();
      characterObj.getWorldDirection(forward);

      // Place the panel in front the character
      targetPos.add(forward.clone().multiplyScalar(1.2));

      targetPos.y += 1.6; //offset - above the character's head

      // make it look in the same direction the character is facing
      const lookAtPos = targetPos.clone().add(forward);

      console.log(`[CharacterDialogueDisplay] Panel positioned near character "${charName}" at:`, targetPos);

      panelObj.position.copy(targetPos);
      panelObj.lookAt(lookAtPos); // Look in the same direction the character is facing
    } else {
      camObj.getWorldPosition(lookAtPos);

      const forward = new THREE.Vector3();
      camObj.getWorldDirection(forward);
      targetPos.copy(lookAtPos.clone().add(forward.multiplyScalar(-distance)));

      console.warn(`[CharacterDialogueDisplay] Character "${charName}" not found — defaulting to camera position`);
    }
    targetPos.y = Math.max(targetPos.y, 1.2); // Ensure the panel is above the ground

    panelObj.position.copy(targetPos);
    panelObj.lookAt(lookAtPos);
  }, 0);
}, [mode, character]);

  if (mode === "vr") {
    return (
      <a-entity id="character-dialogue-panel" position="0 1.6 -2">
        {/* Character image */}
        {characterImg && (
          <a-image
            src={characterImg}
            position="-1 0.5 0"
            width="0.8"
            height="0.8"
            material="shader: flat"
          ></a-image>
        )}

        {/* Dialogue text panel */}
        <a-plane
          width="3"
          height="1.5"
          color="white"
          position="0 0 -0.5"
          material="side: double"
        >
          <a-text
            value={dialogue}
            wrap-count="40"
            color="black"
            align="center"
            position="0 0 0.01"
          ></a-text>
        </a-plane>

        {/* VR "Next" button */}
        <a-box
          id="vr-dialogue-next"
          position="0 -1 0"
          width="1.2"
          height="0.4"
          depth="0.05"
          color="#007BFF"
          class="clickable"
        >
          <a-text
            value="Avançar"
            align="center"
            color="white"
            position="0 0 0.05"
          ></a-text>
        </a-box>
      </a-entity>
    );
  }

  // === Default screen/AR mode ===
  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "91vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
      }}
    >
      <IconButton
        sx={{
          position: "fixed",
          bottom: 75,
          right: "15px",
          backgroundColor: secondaryColor,
          borderColor: primaryColor,
          borderWidth: 2,
          borderStyle: "solid",
          "&:hover": {
            backgroundColor: primaryColor,
            borderColor: secondaryColor,
            color: secondaryColor + " !important",
            borderWidth: 2,
            borderStyle: "solid",
          },
        }}
        onClick={() => {
          if (skipToEnd) {
            if (audioSrc) audioSrc.pause();
            setNextDialogueNode();
          }
          setSkipToEnd(true);
        }}
      >
        <Icon color="inherit" sx={{ fontSize: "40px !important" }}>
          skip_next
        </Icon>
      </IconButton>

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
          backgroundColor: "white",
          border: "2px solid black",
          borderRadius: "5px",
          marginTop: 2,
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
            text={dialogue}
            delay={100}
            skipToEnd={skipToEnd}
            onComplete={() => setSkipToEnd(true)}
          />
        </Typography>
      </Box>
    </Box>
  );
}

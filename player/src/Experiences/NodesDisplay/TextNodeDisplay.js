import {
  Box,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { backgroundColor as defaultBg } from "../../themes";
import { ApiDataRepository } from "../../api/ApiDataRepository";
import LocationBasedARDisplay from "./LocationBasedARDisplay";
import ImageTrackingBasedARDisplay from "./ImageTrackingBasedARDisplay";
import PlayerTextFinalDisplay from "./util/PlayerTextFinalDisplay";
import VRCharacterPanel from "./util/VRCharacterPanel";
import GoToNextSlideButton from "./util/GoToNextSlideButton";
import Typewriter from "./util/TypeWriter";
import { AREntityTypes } from "../../models/AREntityTypes";
import { ARTriggerMode } from "../../models/ARTriggerModes";
import * as THREE from "three";

export default function TextNodeDisplay({
  node,
  possibleNextNodes,
  characters,
  onNext,
  mode,
}) {
  const repo = ApiDataRepository.getInstance();
  const text = node.data.text;
  const character = node.actor;
  const textColor = node.data.color;
  const backgroundFileInfo = node.data.background;

  const ARTypeInfo = node.data.ar_type;
  const isAR = node.data.ar;
  const position = node.data.position;
  const scale = node.data.scale;

  const [characterImg, setCharacterImg] = useState("");
  const [backgroundURL, setBackgroundURL] = useState("");
  const [bgColor, setBgColor] = useState(defaultBg);
  const [markerSrc, setMarkerSrc] = useState("");

  console.log("[TextNodeDisplay] character:", character);

  useEffect(() => {
    if (!character) return;

    const fullCharacter = characters.find(c => c.id === character.id || c.name === character.name);

    if (!fullCharacter?.image?.filename) return;

    if (fullCharacter.image.inputType === "url") {
      setCharacterImg(fullCharacter.image.filename);
    } else {
      repo
        .getFilePath(fullCharacter.image.filename)
        .then(setCharacterImg)
        .catch(() => {});
    }
  }, [character, characters, repo]);

  useEffect(() => {
    if (!backgroundFileInfo) return;
    if (backgroundFileInfo.inputType === "color") {
      setBgColor(backgroundFileInfo.color);
      setBackgroundURL("");
    } else if (backgroundFileInfo.inputType === "url") {
      setBackgroundURL(backgroundFileInfo.filename);
    } else if (backgroundFileInfo.filename) {
      repo.getFilePath(backgroundFileInfo.filename).then(setBackgroundURL).catch(() => setBackgroundURL(""));
    }
  }, [backgroundFileInfo]);

  useEffect(() => {
    if (!isAR || !ARTypeInfo) return;
    if (ARTypeInfo.trigger_mode === ARTriggerMode.QRCode) {
      repo.getFilePath(ARTypeInfo.qr_code).then(setMarkerSrc);
    } else if (ARTypeInfo.image.inputType === "url") {
      setMarkerSrc(ARTypeInfo.image.filename);
    } else {
      repo.getFilePath(ARTypeInfo.image.filename).then(setMarkerSrc).catch(() => {});
    }
  }, [ARTypeInfo]);

  // === VR Positioning ===
  useEffect(() => {
    if (mode !== "vr") return;

    setTimeout(() => {
      const scene = document.querySelector("a-scene");
      const camEl = scene?.querySelector("[camera]");
      const panelEl = scene?.querySelector("#text-panel");

      if (!camEl || !panelEl) {
        console.warn("[TextNodeDisplay] Camera or panel not found");
        return;
      }

      const camObj = camEl.object3D;
      const panelObj = panelEl.object3D;

      const distance = 2.5;
      const minY = 1.5;

      let targetPos = new THREE.Vector3();
      let lookAtPos = new THREE.Vector3();

      const fullCharacter = characters.find(c => c.id === character.id || c.name === character.name);
      console.log("[TextNodeDisplay] Full character:", fullCharacter);
      const characterEl = scene?.querySelector(`[id="${fullCharacter.threeDObject}"]`);
      console.log("[TextNodeDisplay] Character element:", characterEl);

      if (characterEl && characterEl.object3D) {
        const charObj = characterEl.object3D;
        charObj.getWorldPosition(targetPos);
        targetPos.y += 1.5; // Raise above character
        const forward = new THREE.Vector3();
        charObj.getWorldDirection(forward);
        targetPos.add(forward.multiplyScalar(1.5));
        lookAtPos.copy(charObj.position);

        console.log("[TextNodeDisplay] Positioned near character:", fullCharacter.threeDObject);
      } else {
        camObj.getWorldPosition(lookAtPos);
        const forward = new THREE.Vector3();
        camObj.getWorldDirection(forward);
        targetPos.copy(lookAtPos.clone().add(forward.multiplyScalar(-distance)));
        console.warn("[TextNodeDisplay] Character not found, defaulting to camera");
      }

      targetPos.y = Math.max(targetPos.y, minY);
      panelObj.position.copy(targetPos);
      panelObj.lookAt(lookAtPos);
    }, 0);
  }, [mode, character]);

  // === VR Mode ===
  if (mode === "vr") {
    return (
      <VRCharacterPanel
        id="text-panel"
        characterImg={characterImg}
        characterName={character?.name}
        panelText={text}
        buttonElements={
          <a-box
            position="0 -0.7 0.01"
            width="2"
            height="0.4"
            depth="0.05"
            color="#4caf50"
            class="clickable"
            onClick={() => onNext?.()}
          >
            <a-text
              value="Continuar"
              align="center"
              color="white"
              position="0 0 0.05"
              wrap-count="20"
            ></a-text>
          </a-box>
        }
      />
    );
  }

  // === AR / Screen Mode ===
  return (
    <Box
      sx={{
        width: "100%",
        height: isAR ? "100%" : "91vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
        background:
          backgroundURL === ""
            ? bgColor
            : `${bgColor} url(${backgroundURL}) no-repeat center center fixed`,
        backgroundSize: "cover",
      }}
    >
      {isAR ? (
        ARTypeInfo.trigger_mode === ARTriggerMode.GPSCoords ? (
          <LocationBasedARDisplay
            name={text}
            map={ARTypeInfo.map}
            place={ARTypeInfo.place}
            tolerance={ARTypeInfo.tolerance}
            position={position}
            scale={scale}
            entityType={AREntityTypes.Text}
            color={textColor}
          />
        ) : (
          <ImageTrackingBasedARDisplay
            name={text}
            markerSrc={markerSrc}
            position={position}
            scale={scale}
            entityType={AREntityTypes.Text}
            color={textColor}
          />
        )
      ) : (
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
            }}
          >
            <Typography
              variant="h6"
              sx={{
                px: 3,
                py: 1,
                fontSize: 20,
                color: textColor|| "black",
                fontWeight: 200,
                whiteSpace: "pre-wrap",
              }}
            >
              <Typewriter text={text} delay={100} />
            </Typography>
          </Box>
        </>
      )}

      <GoToNextSlideButton
        currentNode={node}
        onAdvance={() => onNext?.()}
      />
    </Box>
  );
}

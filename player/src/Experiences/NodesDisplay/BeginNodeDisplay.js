import React, { useEffect } from "react";
import { Box, ButtonBase, Typography } from "@mui/material";
import { backgroundColor, textColor } from "../../themes";
import Typewriter from "./util/TypeWriter";
import * as THREE from "three";

export default function BeginNodeDisplay(props) {
  const { node: beginNode, possibleNextNodes, setNextNode, experienceName, mode } = props;

  // Position the panel in front of the player
  useEffect(() => {
    if (mode !== "vr") return;

    setTimeout(() => {
      const scene = document.querySelector("a-scene");
      const camEl = scene?.querySelector("[camera]");
      const panelEl = scene?.querySelector("#begin-panel-wrapper");

      if (!camEl || !panelEl) {
        console.warn("[BeginNodeDisplay] Camera or panel not found");
        return;
      }

      const camObj = camEl.object3D;
      const panelObj = panelEl.object3D;

      const camPos = new THREE.Vector3();
      camObj.getWorldPosition(camPos);

      const forward = new THREE.Vector3();
      camObj.getWorldDirection(forward);

      const distance = 4;
      const panelPos = camPos.clone().add(forward.multiplyScalar(distance));

      panelObj.position.copy(panelPos);
      panelObj.lookAt(camPos);

      console.log("[BeginNodeDisplay] Panel positioned in front of player at", panelPos);
    }, 0);
  }, [mode]);

  // Register click event using A-Frame event system
  useEffect(() => {
    if (mode !== "vr") return;

    const buttonEl = document.querySelector("#start-button");
    if (!buttonEl) return;

    const handleClick = () => {
      console.log("[BeginNodeDisplay] Start button clicked");
      if (possibleNextNodes?.length > 0) {
        setNextNode(possibleNextNodes[0]);
      }
    };

    buttonEl.addEventListener("click", handleClick);
    return () => buttonEl.removeEventListener("click", handleClick);
  }, [mode, possibleNextNodes, setNextNode]);

  console.log("[BeginNodeDisplay] Rendering in mode:", mode);

  if (mode === "vr") {
    return (
      <a-entity id="begin-panel-wrapper">
        {/* Background panel */}
        <a-entity
          id="begin-panel"
          geometry="primitive: plane; height: 2.2; width: 4"
          material="color: white; side: double; opacity: 0.95"
          text={`value: Bem-vind@ ao ${experienceName}; align: center; color: black; wrapCount: 32`}
          position="0 0 0.01"
        ></a-entity>

        {/* Clickable box button */}
        <a-box
          id="start-button"
          position="0 -1.0 0.05"
          depth="0.05"
          height="0.5"
          width="1.5"
          color="#007BFF"
          class="clickable"
          event-set__enter="_event: mouseenter; color: red"
          event-set__leave="_event: mouseleave; color: #007BFF"
        >
          <a-text
            value="Começar"
            align="center"
            color="white"
            position="0 0 0.05"
          ></a-text>
        </a-box>
      </a-entity>
    );
  }

  // Default 2D fallback (AR/screen)
  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "85vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
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
            fontSize: 25,
            color: "black",
            fontWeight: 200,
            whiteSpace: "pre-wrap",
          }}
        >
          <Typewriter text={"Bem-vind@ ao " + experienceName} delay={100} />
        </Typography>
      </Box>

      <ButtonBase
        sx={{
          mt: 2,
          backgroundColor: backgroundColor,
          color: textColor,
          borderRadius: "5px",
          p: 2,
        }}
        onClick={() => {
          console.log("[BeginNodeDisplay] Button clicked in AR mode");
          setNextNode(possibleNextNodes[0]);
        }}
      >
        <Typography variant="h4">Começar</Typography>
      </ButtonBase>
    </Box>
  );
}

import React, { useEffect } from "react";
import { Box, ButtonBase, Typography } from "@mui/material";
import { backgroundColor, textColor } from "../../themes";
import Typewriter from "./util/TypeWriter";
import * as THREE from "three";

export default function EndNodeDisplay({
  node,
  onNext,
  mode,
}) {
  console.log("[EndNodeDisplay] Rendering End Node:", node);
  const endName = node?.data?.ending;

  // Position the panel in front of the player in VR
  useEffect(() => {
    if (mode !== "vr") return;

    setTimeout(() => {
      const scene = document.querySelector("a-scene");
      const camEl = scene?.querySelector("[camera]");
      const panelEl = scene?.querySelector("#end-panel-wrapper");

      if (!camEl || !panelEl) {
        console.warn("[EndNodeDisplay] Camera or panel not found");
        return;
      }

      const camObj = camEl.object3D;
      const panelObj = panelEl.object3D;

      const camPos = new THREE.Vector3();
      camObj.getWorldPosition(camPos);

      const forward = new THREE.Vector3();
      camObj.getWorldDirection(forward);

      const distance = 4;
      const panelPos = camPos.clone().add(forward.multiplyScalar(-distance)); // -distance because for some reason forward is back

      panelPos.y = Math.max(panelPos.y, 1.2);
      panelObj.position.copy(panelPos);
      panelObj.lookAt(camPos);

      console.log("[EndNodeDisplay] Panel positioned in front of player", panelPos);
    }, 0);
  }, [mode]);

  // Attach VR click event handler
  useEffect(() => {
    if (mode !== "vr") return;

    const buttonEl = document.querySelector("#end-button");
    if (!buttonEl) return;

    const handleClick = () => {
      console.log("[EndNodeDisplay] Terminar clicked");
      onNext?.();
    };

    buttonEl.addEventListener("click", handleClick);
    return () => buttonEl.removeEventListener("click", handleClick);
  }, [mode, onNext]);

  console.log("[EndNodeDisplay] Rendering in mode:", mode);

  if (mode === "vr") {
    return (
      <a-entity id="end-panel-wrapper">
        <a-entity
          id="end-panel"
          geometry="primitive: plane; height: 2.2; width: 4"
          material="color: white; side: double; opacity: 0.95"
          text={`value: FIM!\nFinal obtido: ${endName}; align: center; color: black; wrapCount: 34`}
          position="0 0 0.01"
        ></a-entity>

        <a-box
          id="end-button"
          position="0 -1.0 0.05"
          depth="0.05"
          height="0.5"
          width="1.5"
          color="#28a745"
          class="clickable"
          event-set__enter="_event: mouseenter; color: red"
          event-set__leave="_event: mouseleave; color: #28a745"
        >
          <a-text
            value="Terminar"
            align="center"
            color="white"
            position="0 0 0.05"
          ></a-text>
        </a-box>
      </a-entity>
    );
  }

  // Fallback to AR / screen mode
  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "91vh",
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
          <Typewriter
            text={`Obrigado por ter experienciado,\nVocê obteve o final ${endName}`}
            delay={100}
          />
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
          console.log("[EndNodeDisplay] Terminar clicked (screen mode)");
          onNext?.();
        }}
      >
        <Typography variant="h4">Terminar</Typography>
      </ButtonBase>
    </Box>
  );
}

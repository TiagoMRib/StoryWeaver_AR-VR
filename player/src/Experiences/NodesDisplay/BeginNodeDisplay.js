import React, { useEffect } from "react";
import { Box, ButtonBase, Typography } from "@mui/material";
import { backgroundColor, textColor } from "../../themes";
import Typewriter from "./util/TypeWriter";
import * as THREE from "three";

export default function BeginNodeDisplay(props) {
  const {
    node: beginNode,
    possibleNextNodes,
    setNextNode,
    experienceName,
    mode,
    spawnPoint,
  } = props;

  // Position the panel in front of the player (VR mode)
  useEffect(() => {
    if (mode !== "vr") return;

    const scene = document.querySelector("a-scene");
    const panelEl = scene?.querySelector("#begin-panel-wrapper");

    if (!panelEl) {
      console.warn("[BeginNodeDisplay] Panel element not found.");
      return;
    }

    console.log("[BeginNodeDisplay] Placing panel in front of spawn point", spawnPoint);

    const panelObj = panelEl.object3D;

    // Find the spawn point object
    let spawnObj = null;
    scene?.object3D?.traverse((child) => {
      if (child.name === spawnPoint) {
        spawnObj = child;
      }
    });

    if (!spawnObj) {
      console.warn("[BeginNodeDisplay] SpawnPoint not found — fallback to origin.");
      panelObj.position.set(0, 1.6, -4);
      panelObj.lookAt(new THREE.Vector3(0, 1.6, 0));
      return;
    }

    const spawnPos = new THREE.Vector3();
    spawnObj.getWorldPosition(spawnPos);

    const forward = new THREE.Vector3(0, 0, -1);
    spawnObj.getWorldDirection(forward);

    const panelPos = spawnPos.clone().add(forward.multiplyScalar(3));
    panelPos.y += 1.2;

    panelObj.position.copy(panelPos);

    const lookAt = spawnPos.clone();
    lookAt.y = panelPos.y;
    panelObj.lookAt(lookAt);

    console.log("[BeginNodeDisplay] Panel placed relative to SpawnPoint at:", panelPos);
  }, [mode, spawnPoint]);

  // Register VR click event
  useEffect(() => {
    if (mode !== "vr") return;

    const buttonEl = document.querySelector("#start-button");
    if (!buttonEl) return;

    const handleClick = () => {
      console.log("[BeginNodeDisplay] Start button clicked");
      if (possibleNextNodes?.[0]) {
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
          text={`value: Bem-vind@ ao ${experienceName}; align: center; color: black; wrapCount: 32;`}
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

  // Default 2D fallback (AR/screen mode)
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
          <Typewriter text={`Bem-vind@ ao ${experienceName}`} delay={100} />
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
          if (possibleNextNodes?.[0]) {
            setNextNode(possibleNextNodes[0]);
          }
        }}
      >
        <Typography variant="h4">Começar</Typography>
      </ButtonBase>
    </Box>
  );
}

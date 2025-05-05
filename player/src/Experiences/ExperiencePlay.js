import React, { useState } from "react";
import { Box, ButtonBase, Typography } from "@mui/material";
import { ComponentState } from "../models/ComponentState";
import ExperienceLoader from "./ExperienceLoader";

export default function ExperiencePlay({ projectId, projectData, setExperience }) {
  const [playMode, setPlayMode] = useState(undefined);
  const [vrStage, setVrStage] = useState("select"); // "select" | "upload" | "play"
  const [glbUrl, setGlbUrl] = useState(null);

  if (!playMode) {
    return (
      <Box sx={centerBox}>
        <Typography variant="h4" sx={{ mb: 3 }}>
          Escolha o modo:
        </Typography>
        <ButtonBase onClick={() => setPlayMode("AR")} sx={buttonStyle("green")}>
          AR
        </ButtonBase>
        <ButtonBase
          onClick={() => {
            setPlayMode("VR");
            setVrStage("upload");
          }}
          sx={buttonStyle("blue")}
        >
          VR
        </ButtonBase>
      </Box>
    );
  }

  if (playMode === "VR" && vrStage === "upload") {
    return (
      <Box sx={centerBox}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          Faça upload do seu ficheiro .glb:
        </Typography>
        <input
          type="file"
          accept=".glb,.gltf"
          onChange={(e) => {
            const file = e.target.files[0];
            if (!file) return;
            setGlbUrl(null); // Force reset
            setTimeout(() => setGlbUrl(URL.createObjectURL(file)), 0);
            setVrStage("play");
          }}
        />
        <Typography sx={{ mt: 2 }} variant="body2">
          O ficheiro deve conter os mesmos nomes dos objetos do JSON para funcionar corretamente.
        </Typography>
      </Box>
    );
  }

  return (
    <ExperienceLoader
      projectId={projectId}
      passedProjectData={projectData}
      setExperience={setExperience}
      playMode={playMode}
      glbUrl={glbUrl}
    />
  );
}

// 🔧 Utility styles
const centerBox = {
  width: "100%",
  height: "100%",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
};

const buttonStyle = (color) => ({
  backgroundColor: color === "green" ? "#4caf50" : "#2196f3",
  color: "white",
  fontSize: "20px",
  p: 2,
  borderRadius: 3,
  mb: color === "green" ? 2 : 0,
});

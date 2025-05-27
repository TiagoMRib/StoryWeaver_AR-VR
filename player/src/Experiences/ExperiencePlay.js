import React, { useState, useEffect } from "react";
import { Box, Typography } from "@mui/material";
import ExperienceLoader from "./ExperienceLoader";

export default function ExperiencePlay({ projectId, projectData, setExperience }) {
  const [vrStage, setVrStage] = useState("upload");
  const [glbUrl, setGlbUrl] = useState(null);

  const platformType = projectData?.platformType;

  useEffect(() => {
    if (platformType === "AR") {
      setVrStage("play"); // Skip GLB for AR
    }
  }, [platformType]);

  // VR: Upload .glb
  if (platformType === "VR" && vrStage === "upload") {
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
            const tempUrl = URL.createObjectURL(file);
            setGlbUrl(tempUrl);
            setVrStage("play");
          }}
        />
      </Box>
    );
  }

  // Final play stage (AR or VR)
  if (vrStage === "play" || platformType === "AR") {
    return (
      <ExperienceLoader
        projectId={projectId}
        passedProjectData={projectData}
        setExperience={setExperience}
        playMode={platformType}
        glbUrl={glbUrl}
      />
    );
  }

  return null;
}

// Styles
const centerBox = {
  width: "100%",
  height: "100%",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
};

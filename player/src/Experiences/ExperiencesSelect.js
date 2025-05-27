import { Box, Typography, ButtonBase } from "@mui/material";
import React, { useState } from "react";
import { primaryColor, textColor } from "../themes";

export default function ExperiencesSelect(props) {
  const setExperience = props.setExperience;

  const [platformType, setPlatformType] = useState(undefined);
  const [worldFile, setWorldFile] = useState(null);
  const [platformFile, setPlatformFile] = useState(null);
  const [storyFile, setStoryFile] = useState(null);

  const handleFilesLoad = async () => {
    if (!worldFile || !platformFile || !storyFile || !platformType) {
      alert("Por favor selecione todos os ficheiros e o tipo de plataforma.");
      return;
    }

    try {
      const [worldText, platformText, storyText] = await Promise.all([
        worldFile.text(),
        platformFile.text(),
        storyFile.text(),
      ]);

      const worldJson = JSON.parse(worldText);
      const platformJson = JSON.parse(platformText);
      const storyJson = JSON.parse(storyText);

      const combined = {
        platformType,
        ...worldJson,
        ...platformJson,
        ...storyJson,
      };

      // Save to localStorage (related to the old way, not remving it for now)
      localStorage.setItem("platformType", platformType);
      localStorage.setItem("nodes", JSON.stringify(storyJson.nodes || []));
      localStorage.setItem("edges", JSON.stringify(storyJson.edges || []));
      localStorage.setItem("characters", JSON.stringify(worldJson.characters || []));
      localStorage.setItem("locations", JSON.stringify(worldJson.locations || []));
      localStorage.setItem("projectTitle", worldJson.projectTitle || "Experiência Local");

      setExperience(combined);
    } catch (err) {
      alert("Erro ao carregar os ficheiros JSON.");
      console.error(err);
    }
  };

  return (
    <Box sx={{ width: "100%", pb: 10, px: 3 }}>
      <Typography variant="h4" sx={{ pt: 2, textAlign: "center" }}>
        Experiência Local
      </Typography>

      <Box sx={{ mt: 4 }}>
        <Typography variant="h6">Escolha a plataforma:</Typography>
        <Box sx={{ display: "flex", gap: 2, my: 2 }}>
          <ButtonBase
            onClick={() => setPlatformType("AR")}
            sx={platformButtonStyle(platformType === "AR")}
          >
            AR
          </ButtonBase>
          <ButtonBase
            onClick={() => setPlatformType("VR")}
            sx={platformButtonStyle(platformType === "VR")}
          >
            VR
          </ButtonBase>
        </Box>
      </Box>

      <Box sx={{ mt: 4 }}>
        <Typography variant="h6">Carregue os ficheiros JSON</Typography>

        <input type="file" accept=".json" onChange={(e) => setWorldFile(e.target.files[0])} />
        <Typography sx={{ mb: 2 }}>Manifesto do Mundo</Typography>

        <input type="file" accept=".json" onChange={(e) => setPlatformFile(e.target.files[0])} />
        <Typography sx={{ mb: 2 }}>
          Manifesto da Plataforma ({platformType || "Escolha a plataforma primeiro"})
        </Typography>

        <input type="file" accept=".json" onChange={(e) => setStoryFile(e.target.files[0])} />
        <Typography sx={{ mb: 2 }}>Coreografia</Typography>
      </Box>

      <Box sx={{ mt: 3 }}>
        <Box
          onClick={handleFilesLoad}
          sx={{
            backgroundColor: primaryColor,
            color: "white",
            px: 3,
            py: 1,
            borderRadius: 2,
            cursor: "pointer",
            display: "inline-block",
          }}
        >
          <Typography variant="body1">Iniciar Experiência</Typography>
        </Box>
      </Box>
    </Box>
  );
}

// Button styling for selected/unselected
const platformButtonStyle = (selected) => ({
  backgroundColor: selected ? "#2196f3" : "#eeeeee",
  color: selected ? "white" : "#333",
  px: 3,
  py: 1,
  borderRadius: 2,
  fontSize: "16px",
});

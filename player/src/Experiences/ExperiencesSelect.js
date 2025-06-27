import React, { useState } from "react";
import {
  Box,
  Typography,
  ButtonBase,
  Dialog,
  DialogTitle,
  DialogActions,
  Button,
} from "@mui/material";
import { primaryColor } from "../themes";

export default function ExperiencesSelect({ setExperience }) {
  const [platformType, setPlatformType] = useState(undefined);
  const [worldFile, setWorldFile] = useState(null);
  const [platformFile, setPlatformFile] = useState(null);
  const [storyFile, setStoryFile] = useState(null);
  const [combinedJsonFile, setCombinedJsonFile] = useState(null);
  const [combinedData, setCombinedData] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  const handleCombinedLoad = async () => {
    try {
      const text = await combinedJsonFile.text();
      const json = JSON.parse(text);
      setExperience(json);
    } catch (err) {
      alert("Erro ao carregar o ficheiro combinado.");
      console.error(err);
    }
  };

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

      setCombinedData(combined);
      setOpenDialog(true);
    } catch (err) {
      alert("Erro ao carregar os ficheiros JSON.");
      console.error(err);
    }
  };

  const downloadCombinedJson = () => {
    const blob = new Blob([JSON.stringify(combinedData, null, 2)], {
      type: "application/json",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${combinedData.title }.json`;
    link.click();
  };

  const proceedWithExperience = () => {
    if (!combinedData) return;
    localStorage.setItem("platformType", combinedData.platformType);
    localStorage.setItem("nodes", JSON.stringify(combinedData.nodes || []));
    localStorage.setItem("edges", JSON.stringify(combinedData.edges || []));
    localStorage.setItem(
      "characters",
      JSON.stringify(combinedData.characters || [])
    );
    localStorage.setItem(
      "locations",
      JSON.stringify(combinedData.locations || [])
    );
    localStorage.setItem(
      "projectTitle",
      combinedData.title
    );
    setExperience(combinedData);
  };

  return (
    <Box sx={{ width: "100%", pb: 10, px: 3 }}>
  <Typography variant="h4" sx={{ pt: 2, textAlign: "center" }}>
    Carregar Experiência
  </Typography>

  {/* Ficheiro completo */}
  <Box sx={{ mt: 4 }}>
    <Typography variant="h6">Carregue ficheiro completo:</Typography>
    <Box sx={{ display: "flex", justifyContent: "center", flexDirection: "column", alignItems: "center", mt: 1 }}>
      <input
        type="file"
        accept=".json"
        onChange={(e) => setCombinedJsonFile(e.target.files[0])}
      />
      <Button
        variant="contained"
        disabled={!combinedJsonFile}
        onClick={handleCombinedLoad}
        sx={{ mt: 1 }}
      >
        Usar ficheiro completo
      </Button>
    </Box>
  </Box>

  <Typography variant="h6" sx={{ mt: 5 }}>
    OU selecione ficheiros manualmente:
  </Typography>

  {/* Plataforma toggle */}
  <Box sx={{ mt: 2 }}>
    <Typography variant="h6">Escolha a plataforma:</Typography>
    <Box sx={{ display: "flex", justifyContent: "center", gap: 2, my: 2 }}>
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

        <input
          type="file"
          accept=".json"
          onChange={(e) => setWorldFile(e.target.files[0])}
        />
        <Typography sx={{ mb: 2 }}>Manifesto do Mundo</Typography>

        <input
          type="file"
          accept=".json"
          onChange={(e) => setPlatformFile(e.target.files[0])}
        />
        <Typography sx={{ mb: 2 }}>
          Manifesto da Plataforma ({platformType || "Escolha a plataforma"})
        </Typography>

        <input
          type="file"
          accept=".json"
          onChange={(e) => setStoryFile(e.target.files[0])}
        />
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

      {/* === Dialog === */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Deseja exportar a experiência completa?</DialogTitle>
        <DialogActions>
          <Button
            onClick={() => {
              downloadCombinedJson();
              proceedWithExperience();
              setOpenDialog(false);
            }}
          >
            Exportar e Prosseguir
          </Button>
          <Button
            onClick={() => {
              proceedWithExperience();
              setOpenDialog(false);
            }}
          >
            Prosseguir
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

const platformButtonStyle = (selected) => ({
  backgroundColor: selected ? "#2196f3" : "#eeeeee",
  color: selected ? "white" : "#333",
  px: 3,
  py: 1,
  borderRadius: 2,
  fontSize: "16px",
});

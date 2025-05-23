import React, { useState } from "react";
import { Box, ButtonBase, Typography } from "@mui/material";
import { ComponentState } from "../models/ComponentState";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

import ExperienceLoader from "./ExperienceLoader";




export default function ExperiencePlay({ projectId, projectData, setExperience }) {
  const [playMode, setPlayMode] = useState(undefined);
  const [vrStage, setVrStage] = useState("select"); // "select" | "upload" | "play"
  const [glbUrl, setGlbUrl] = useState(null);

  const [availableLocations, setAvailableLocations] = useState([]);
  const [missingLocations, setMissingLocations] = useState([]);
  const [missingCharacters, setMissingCharacters] = useState([]);

  console.log("[ExperiencePlay] Project Data:", projectData);

  // Utility to extract all object names from a GLB
  const getObjectNamesFromGLB = async (url) => {
    const loader = new GLTFLoader();
    return new Promise((resolve, reject) => {
      loader.load(
        url,
        (gltf) => {
          const names = [];
          gltf.scene.traverse((child) => {
            if (child.name) names.push(child.name);
          });
          resolve(names);
        },
        undefined,
        (err) => reject(err)
      );
    });
  };

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
          onChange={async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const tempUrl = URL.createObjectURL(file);
            setGlbUrl(null); // reset before re-upload
            setTimeout(() => setGlbUrl(tempUrl), 0);

            try {
              const objectNames = await getObjectNamesFromGLB(tempUrl);

              
              const missingLocations = projectData.locations.filter(
                (loc) => !objectNames.includes(loc.name)
              );

              const missingCharacters = projectData.characters.filter(
                (char) => !objectNames.includes(char.name)
              );

              console.log("[DEBUG] Missing Locations:", missingLocations);
              console.log("[DEBUG] Missing Characters:", missingCharacters);

              //store these in state to show in the UI
              setMissingLocations(missingLocations);
              setMissingCharacters(missingCharacters);
              setAvailableLocations(
                projectData.locations.filter((loc) =>
                  objectNames.includes(loc.name)
                )
              );

              setVrStage("selectStart"); // show the selection UI
            } catch (err) {
              console.error("Failed to parse GLB:", err);
              alert("Erro ao carregar o ficheiro GLB.");
            }
          }}
        />
        <Typography sx={{ mt: 2 }} variant="body2">
          O ficheiro deve conter os mesmos nomes dos objetos do JSON para funcionar corretamente.
        </Typography>
      </Box>
    );
  }
  if (playMode === "VR" && vrStage === "selectStart") {
    return (
      <Box sx={centerBox}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          Escolha o local de início:
        </Typography>
        {availableLocations.map((loc) => (
          <ButtonBase
            key={loc.id}
            onClick={() => {
              localStorage.setItem("vrPlayerStart", loc.name); // or store in state
              setVrStage("play");
            }}
            sx={buttonStyle("green")}
          >
            {loc.name}
          </ButtonBase>
        ))}

        <Typography variant="h6" sx={{ mt: 4 }}>Problemas detectados:</Typography>
        {missingLocations.length > 0 && (
          <Typography variant="body2">
            Locais sem objeto 3D: {missingLocations.map((l) => l.name).join(", ")}
          </Typography>
        )}
        {missingCharacters.length > 0 && (
          <Typography variant="body2">
            Personagens sem objeto 3D: {missingCharacters.map((c) => c.name).join(", ")}
          </Typography>
        )}
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

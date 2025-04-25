import React, { useState } from "react";
import { Box, Button, Typography, Accordion, AccordionSummary, AccordionDetails } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { textColor, primaryColor, secondaryColor } from "../themes";

export default function VRWorldWindow({ setCharacters, setMaps, setVRLocations }) {
  const [jsonPreview, setJsonPreview] = useState(null);

  const handleFileUpload = (e) => {
    const fileReader = new FileReader();
    fileReader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        setJsonPreview(data);
  
        // Update characters
        setCharacters((prev) => {
          const newActors = data.actors || [];
          const uniqueNew = newActors.filter(
            (name) => !prev.some((c) => c.name === name)
          );
          const newCharObjs = uniqueNew.map((name, index) => ({
            id: Date.now() + index,
            name: name,
            description: "Importado do Unity",
            image: {
              inputType: "url",
              filename: "",
              blob: null,
            },
          }));
  
          const updated = [...prev, ...newCharObjs];
          localStorage.setItem("characters", JSON.stringify(updated));
          return updated;
        });
  
        // Store VR locations
        const vrLocations = data.locations || [];
        setVRLocations(vrLocations); 
        localStorage.setItem("vrLocations", JSON.stringify(vrLocations));
  
        console.log("Loaded VR scene data:", data);
      } catch (err) {
        alert("Erro ao ler JSON: " + err.message);
      }
    };
    fileReader.readAsText(e.target.files[0]);
  };
  

  const handleScriptDownload = () => {
    const scriptContent = `using UnityEngine;
      using System.IO;
      using System.Collections.Generic;

      public class SceneExporter : MonoBehaviour
      {
          [System.Serializable]
          public class SceneData
          {
              public string playerStart;
              public List<string> locations;
              public List<string> actors;
          }

          [ContextMenu("Export Scene Data to JSON")]
          void ExportSceneData()
          {
              List<string> locations = new List<string>();
              List<string> actors = new List<string>();
              string playerStart = "";

              GameObject[] allObjects = FindObjectsOfType<GameObject>();
              Debug.Log("Found objects: " + allObjects.Length);
              foreach (var obj in allObjects)
              {
                  Debug.Log("Checking object: " + obj.name + " with tag: " + obj.tag);
                  if (obj.CompareTag("Location"))
                  {
                      Debug.Log("Found location: " + obj.name);
                      locations.Add(obj.name);
                  }
                  else if (obj.CompareTag("Actor"))
                  {
                      Debug.Log("Found actor: " + obj.name);
                      actors.Add(obj.name);
                  }
                  else if (obj.CompareTag("Player"))
                  {
                      Debug.Log("Found player start: " + obj.name);
                      playerStart = obj.name;
                  }
              }

              SceneData export = new SceneData
              {
                  playerStart = playerStart,
                  locations = locations,
                  actors = actors
              };

              string json = JsonUtility.ToJson(export, true);
              string path = Path.Combine(Application.dataPath, "sceneData.json");
              File.WriteAllText(path, json);
              Debug.Log("Scene exported to: " + path);
          }
      }`;
  
    const blob = new Blob([scriptContent], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "SceneExporter.cs";
    link.click();
  };
  

  return (
    <Box
      sx={{
        padding: 4,
        backgroundColor: primaryColor,
        height: "calc(100vh - 64px)",
        color: textColor,
      }}
    >
      <Typography variant="h5" sx={{ mb: 2 }}>
        Mundo VR
      </Typography>

      <Typography sx={{ mb: 2 }}>
      Faça upload de um ficheiro .json exportado do Unity contendo os locais, os atores e a posição inicial do jogador da sua cena VR.
      Para gerar este ficheiro, basta importar e executar o script disponível para download no seu projeto Unity. Ele irá criar automaticamente o ficheiro com os dados necessários.
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "column", mb: 3, gap: 2 }}>
        <Button variant="contained" sx={{ ml: 2, backgroundColor: secondaryColor }} component="label">
          Carregar JSON
          <input type="file" hidden onChange={handleFileUpload} accept=".json" />
        </Button>
        <Button variant="contained" sx={{ ml: 2, backgroundColor: secondaryColor }} onClick={handleScriptDownload}>
          Baixar Script Unity
        </Button>
      </Box>

      <Accordion sx={{ backgroundColor: primaryColor, color: textColor, mb: 2 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: textColor }} />}>
          <Typography>Formato do JSON</Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ backgroundColor: "#fff", color: "#000" }}>
          <Typography variant="body2">
            O ficheiro JSON deve seguir este formato:
          </Typography>
          <pre>
      {`{
        "playerStart": "PlayerSpawnPoint",
        "locations": ["Praia", "Montanha", "Cidade"],
        "actors": ["Aníbal", "João", "Fernando"]
      }`}
          </pre>
          <Typography variant="body2">
            As *tags* usadas em Unity para identificar objetos devem ser: `"Location"`, `"Actor"` e `"Player"`.
          </Typography>
        </AccordionDetails>
      </Accordion>

      <Accordion sx={{ backgroundColor: primaryColor, color: textColor }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: textColor }} />}>
          <Typography>Instruções para o Unity</Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ backgroundColor: "#fff", color: "#000" }}>
          <Typography variant="body2">
            1. Importe o script baixado para a pasta `Assets` no seu projeto Unity. <br />
            2. Atribua-o a um objeto vazio na sua cena. <br />
            3. Clique com o botão direito no componente e escolha “Export Scene Data to JSON”. <br />
            4. O ficheiro `sceneData.json` será criado automaticamente na pasta do projeto.
          </Typography>
        </AccordionDetails>
      </Accordion>



      {jsonPreview && (
        <Box
          sx={{
            mt: 2,
            padding: 2,
            backgroundColor: "white",
            color: "black",
            borderRadius: 2,
            overflowY: "auto",
            maxHeight: "50vh",
          }}
        >
          <Typography variant="h6">Conteúdo:</Typography>
          <pre>{JSON.stringify(jsonPreview, null, 2)}</pre>
        </Box>
      )}
    </Box>
  );
}

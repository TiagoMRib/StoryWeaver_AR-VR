import React, { useState } from "react";
import {
  Box,
  Button,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Select,
  MenuItem,
  TextField,
  FormControl,
  InputLabel,
  Grid
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { textColor, primaryColor, secondaryColor } from "../themes";

export default function VRWorldWindow({ characters, locations, setCharacters, setLocations, actorMapping, setActorMapping, locationMapping, setLocationMapping }) {
  const [jsonPreview, setJsonPreview] = useState(null);

  const handleFileUpload = (e) => {
    const fileReader = new FileReader();
    fileReader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        setJsonPreview({
          actors: Array.isArray(data.actors) ? data.actors : [],
          locations: Array.isArray(data.locations) ? data.locations : []
        });
      } catch (err) {
        alert("Erro ao ler JSON: " + err.message);
      }
    };
    fileReader.readAsText(e.target.files[0]);
};

  const handleScriptDownload = () => {
    const scriptContent = `using UnityEngine;\nusing System.IO;\nusing System.Collections.Generic;\n\npublic class SceneExporter : MonoBehaviour\n{\n    [System.Serializable]\n    public class SceneData { public List<string> locations; public List<string> actors; }\n\n    public string fileName = "sceneData.json";\n\n    [ContextMenu("Export Scene Data to JSON")]\n    void ExportSceneData() {\n        var locations = new List<string>();\n        var actors = new List<string>();\n        foreach (var obj in FindObjectsOfType<GameObject>()) {\n            if (obj.CompareTag("Location")) locations.Add(obj.name);\n            else if (obj.CompareTag("Actor")) actors.Add(obj.name);\n        }\n        var data = new SceneData { locations = locations, actors = actors };\n        var json = JsonUtility.ToJson(data, true);\n        File.WriteAllText(Path.Combine(Application.dataPath, fileName), json);\n        Debug.Log("Exported: " + fileName);\n    }\n}`;
    const blob = new Blob([scriptContent], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "SceneExporter.cs";
    link.click();
  };

  const defaultOptions = [<MenuItem value={""} key="none">None</MenuItem>];

  return (
    <Box sx={{ p:4, bgcolor: textColor, color: textColor, height: '100%' }}>
      <Typography variant="h5" sx={{ mb:2, color: secondaryColor }}>Mundo VR</Typography>
      <Box sx={{ mb:3, display:'flex', gap:2 }}>
        <Button variant="contained" component="label" sx={{ bgcolor: primaryColor }}>
          Carregar JSON
          <input type="file" hidden accept=".json" onChange={handleFileUpload} />
        </Button>
        <Button variant="contained" sx={{ bgcolor: primaryColor }} onClick={handleScriptDownload}>
          Baixar Script Unity
        </Button>
      </Box>

      <Accordion sx={{ bgcolor: primaryColor, mb:2 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color:textColor }} />}>
          <Typography>Formato do JSON</Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ bgcolor:'#fff', color:'#000' }}>
          <pre>{`{
            "locations": ["Praia", "Montanha"],
            "actors": ["Aníbal", "João"]
          }`}</pre>
        </AccordionDetails>
      </Accordion>

      {jsonPreview && (
        <Box sx={{ mb:3, p:2, bgcolor:'#fff', color:'#000', borderRadius:2 }}>
          <Typography variant="h6">Mapeamento</Typography>

          {/* CHARACTERS */}
          <Typography variant="h6" sx={{ mt: 2 }}>Personagens</Typography>
          <Grid container spacing={2}>
            {characters.map((char) => (
              <Grid item xs={12} sm={6} md={4} key={char.id}>
                <Typography>{char.name}</Typography>
                <FormControl fullWidth>
                  <InputLabel>Objeto Unity</InputLabel>
                  <Select
                    value={actorMapping[char.name] || ""}
                    label="Objeto Unity"
                    onChange={(e) => setActorMapping(prev => ({ ...prev, [char.name]: e.target.value }))}
                    sx={{ backgroundColor: "white", color: "black" }}
                  >
                    <MenuItem value="">Nenhum (sem forma física)</MenuItem>
                    {jsonPreview.actors?.map((a) => (
                      <MenuItem key={a} value={a} sx={{ color: "black" }}>
                        {a}
                      </MenuItem>
                    ))}
                    <MenuItem value="custom" sx={{ color: "black" }}>Custom</MenuItem>
                  </Select>
                </FormControl>
                {actorMapping[char.name] === "custom" && (
                  <TextField
                    placeholder="Nome manual"
                    fullWidth
                    onChange={(e) =>
                      setActorMapping(prev => ({ ...prev, [char.name]: e.target.value }))
                    }
                  />
                )}
              </Grid>
            ))}
          </Grid>

          {/* LOCATIONS */}
          <Typography variant="h6" sx={{ mt: 4 }}>Locais</Typography>
          <Grid container spacing={2}>
            {locations.map((loc) => (
              <Grid item xs={12} sm={6} md={4} key={loc.id}>
                <Typography>{loc.name}</Typography>
                <FormControl fullWidth>
                  <InputLabel>Objeto Unity</InputLabel>
                  <Select
                    value={locationMapping[loc.name] || ""}
                    label="Objeto Unity"
                    onChange={(e) => setLocationMapping(prev => ({ ...prev, [loc.name]: e.target.value }))}
                    sx={{ backgroundColor: "white", color: "black" }}
                  >
                    <MenuItem value="">Nenhum (sem forma física)</MenuItem>
                    {jsonPreview.locations?.map((l) => (
                      <MenuItem key={l} value={l} sx={{ color: "black" }}>
                        {l}
                      </MenuItem>
                    ))}
                    <MenuItem value="custom" sx={{ color: "black" }}>Custom</MenuItem>
                  </Select>
                </FormControl>
                {locationMapping[loc.name] === "custom" && (
                  <TextField
                    placeholder="Nome manual"
                    fullWidth
                    onChange={(e) =>
                      setLocationMapping(prev => ({ ...prev, [loc.name]: e.target.value }))
                    }
                  />
                )}
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {jsonPreview && (
        <Box sx={{ p:2, bgcolor:'#fff', color:'#000', borderRadius:2, maxHeight:'40vh', overflow:'auto' }}>
          <Typography variant="h6">Preview JSON</Typography>
          <pre>{JSON.stringify(jsonPreview, null, 2)}</pre>
        </Box>
      )}
    </Box>
  );
}

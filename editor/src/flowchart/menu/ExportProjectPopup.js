import {
  ButtonBase,
  Dialog,
  Icon,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";
import { Box } from "@mui/system";
import * as React from "react";
import {
  primaryColor,
  secondaryColor,
  tertiaryColor,
  textColor,
} from "../../themes";

import ProjectTag from "./ProjectTag";
import { ApiDataRepository } from "../../api/ApiDataRepository";

import { buildChoreography } from "./utils/BuildChoreography";

import {
  buildBaseManifest,
  buildVRManifest,
  buildARManifest
} from "./utils/BuildManifest";

const colors = [
  "#FF0000",
  "#FFA500",
  "#FFFF00",
  "#008000",
  "#0000FF",
  "#4B0082",
  "#EE82EE",

  "#A9A9A9",
  "#FFFFFF",
];

export default function ExportProjectPopup(props) {
  const repo = ApiDataRepository.getInstance();
  const open = props.open;
  const onClose = props.onClose;
  const setDisplayAlert = props.setDisplayAlert;
  const setAlertMessage = props.setDisplayMessage;
  const setSeverity = props.setSeverity;

  const experienceName = props.name;
  const setName = props.setName;

  const description = props.description;
  const setDescription = props.setDescription;
  const tags = props.tags;

  const setTags = props.setTags;

  const projectTitle = props.projectTitle;
  const nodes = props.nodes;
  const edges = props.edges;

  // Actors
  const characters = props.characters;

  const vrActorMapping = props.vrActorMapping;
  const arActorMapping = props.arActorMapping;

  // Locations
  const locations = props.locations;
  const vrLocationMapping = props.vrLocationMapping;
  const arLocationMapping = props.arLocationMapping;

  const maps = props.maps;
  
  // Interactions
  const interactions = props.interactions;
  const vrInteractionMapping = props.vrInteractionMapping;
  const arInteractionMapping = props.arInteractionMapping;


  return (
    <Dialog
      id="export-project-popup"
      open={open}
      onClose={() => onClose(undefined)}
      sx={{
        scrollbarWidth: "thin",
        scrollbarColor: `${primaryColor} ${secondaryColor}`,
      }}
      PaperProps={{
        sx: {
          width: "100%",
          maxWidth: "720px !important",
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          backgroundColor: secondaryColor,
          flexDirection: "column",
          width: "100%",
          zIndex: 1,
          m: "0 auto",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Typography
            variant="h7"
            component="div"
            sx={{
              py: 1,
              px: 4,
              color: textColor,
              textAlign: "center",
              ml: "auto",
              fontWeight: "bold",
              fontSize: 30,
              backgroundColor: primaryColor,
              borderBottomWidth: 3,
              mt: 2,
              mr: 2,
              borderBottomStyle: "solid",
              borderBottomColor: secondaryColor,
            }}
          >
            EXPORTAR
          </Typography>

          <Icon
            fontSize="large"
            onClick={() => onClose(undefined)}
            sx={{
              color: "black",
              ml: "auto",
              fontSize: "50px !important",
              cursor: "pointer",
            }}
          >
            close
          </Icon>
        </Box>

        <Box
          sx={{
            width: "100%",
          }}
        >
          <Box
            sx={{
              py: 5,
              width: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "start",
              alignItems: "center",
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                width: "90%",

                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Typography
                variant="h7"
                component="div"
                sx={{
                  color: primaryColor,
                  fontSize: 20,
                  fontWeight: "bold",
                  m: 2,
                }}
              >
                Nome:
              </Typography>
              <TextField
                placeholder="Nome do projeto..."
                aria-autocomplete="off"
                autoComplete="off"
                fullWidth
                sx={{
                  px: 4,
                  textAlign: "start",

                  backgroundColor: textColor,
                  border: "none",
                  outline: "none",
                  borderRadius: 2,
                  ":&hover": {
                    border: "none",
                    outline: "none",
                  },
                  ".MuiInputBase-root": {
                    textAlign: "center",
                  },
                }}
                InputProps={{
                  disableUnderline: true,
                  sx: {
                    "& .MuiInput-input": {
                      textAlign: "start !important",
                      color: "black",
                      fontSize: "17px",
                      borderRadius: 2,
                    },
                  },
                }}
                id="standard-basic"
                variant="standard"
                value={experienceName}
                onChange={(e) => setName(e.target.value)}
              />
            </Box>

            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                width: "90%",

                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Typography
                variant="h7"
                component="div"
                sx={{
                  color: primaryColor,
                  fontSize: 20,
                  fontWeight: "bold",
                  m: 2,
                }}
              >
                Descrição:
              </Typography>
              <TextField
                placeholder="Descrição do projeto..."
                aria-autocomplete="off"
                autoComplete="off"
                fullWidth
                multiline
                sx={{
                  px: 4,
                  minHeight: "100px",
                  textAlign: "start",
                  backgroundColor: textColor,
                  border: "none",
                  outline: "none",
                  borderRadius: 2,
                  ":&hover": {
                    border: "none",
                    outline: "none",
                  },
                  ".MuiInputBase-root": {
                    textAlign: "center",
                  },
                }}
                InputProps={{
                  disableUnderline: true,
                  sx: {
                    "& .MuiInput-input": {
                      textAlign: "start !important",
                      color: "black",
                      fontSize: "17px",
                      borderRadius: 2,
                    },
                  },
                }}
                id="standard-basic"
                variant="standard"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </Box>

            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                width: "90%",

                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Typography
                variant="h7"
                component="div"
                sx={{
                  color: primaryColor,
                  fontSize: 20,
                  fontWeight: "bold",
                  m: 2,
                }}
              >
                Etiquetas:
              </Typography>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: "10px",
                  mt: 2,
                }}
              >
                {tags.map((tag, index) => {
                  return (
                    <ProjectTag
                      key={index}
                      name={tag.name}
                      setName={(name) => {
                        const newTags = [...tags];
                        newTags[index].name = name;
                        setTags(newTags);
                      }}
                      color={tag.color}
                      onDelete={(name) =>
                        setTags(
                          tags.slice(0, index).concat(tags.slice(index + 1))
                        )
                      }
                    />
                  );
                })}
              </Box>
              <IconButton
                sx={{
                  color: "black",
                  ml: "auto",
                  fontSize: "50px !important",
                  cursor: "pointer",
                }}
                onClick={() =>
                  setTags([
                    ...tags,
                    { name: "", color: colors[tags.length % colors.length] },
                  ])
                }
              >
                <Icon fontSize="inherit">add</Icon>
              </IconButton>
            </Box>

            <ButtonBase
              onClick={() => {
                onClose();

                repo
                  .exportProject(
                    projectTitle,
                    nodes,
                    edges,
                    characters,
                    maps,
                    locations,
                    interactions,
                    experienceName,
                    description,
                    tags,
                    
                  )
                  .then((res) => {
                    localStorage.setItem("experienceName", experienceName);
                    localStorage.setItem("experienceDescription", description);
                    localStorage.setItem(
                      "experienceTags",
                      JSON.stringify(tags)
                    );
                    setSeverity("success");
                    setAlertMessage(
                      "Projeto exportado com sucesso! Já pode ser acessado no Story Player!"
                    );
                    setDisplayAlert(true);
                  })
                  .catch((err) => {
                    console.log(err);
                    setSeverity("error");
                    setAlertMessage(
                      "Algo deu errado ao exportar o projeto! Tente novamente!"
                    );
                    setDisplayAlert(true);
                  });

              }}
              sx={{
                backgroundColor: tertiaryColor,
                color: textColor,
                fontSize: "20px",
                p: 2,
                borderRadius: 3,
                m: 1,
              }}
            >
              Confirmar
            </ButtonBase>


            <ButtonBase
              onClick={() => {
                const manifest = buildBaseManifest({
                  title: experienceName || projectTitle,
                  characters,
                  locations,
                  interactions,
                });

                const jsonData = JSON.stringify(manifest, null, 2);
                const blob = new Blob([jsonData], { type: "application/json" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `${experienceName || projectTitle}_default_manifest.json`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
              }}
              sx={{
                backgroundColor: tertiaryColor,
                color: textColor,
                fontSize: "20px",
                p: 2,
                borderRadius: 3,
                m: 1,
              }}
            >
              Exportar Manifesto
            </ButtonBase>

            <ButtonBase
              onClick={() => {
                const manifest = buildVRManifest({
                  title: experienceName || projectTitle,
                  characters,
                  locations,
                  interactions,
                  vrActorMapping,
                  vrLocationMapping,
                  vrInteractionMapping: props.vrInteractionMapping,
                });

                const jsonData = JSON.stringify(manifest, null, 2);
                const blob = new Blob([jsonData], { type: "application/json" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `${experienceName || projectTitle}_vr_manifest.json`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
              }}
              sx={{
                backgroundColor: tertiaryColor,
                color: textColor,
                fontSize: "20px",
                p: 2,
                borderRadius: 3,
                m: 1,
              }}
            >
              Exportar Manifesto VR
            </ButtonBase>

            <ButtonBase
              onClick={() => {
                const manifest = buildARManifest({
                  title: experienceName || projectTitle,
                  characters,
                  locations,
                  interactions,
                  maps,
                  arActorMapping: props.arActorMapping,
                  arLocationMapping: props.arLocationMapping,
                  arInteractionMapping: props.arInteractionMapping,
                });

                const jsonData = JSON.stringify(manifest, null, 2);
                const blob = new Blob([jsonData], { type: "application/json" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `${experienceName || projectTitle}_ar_manifest.json`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
              }}
              sx={{
                backgroundColor: tertiaryColor,
                color: textColor,
                fontSize: "20px",
                p: 2,
                borderRadius: 3,
                m: 1,
              }}
            >
              Exportar Manifesto AR
            </ButtonBase>

            <ButtonBase
              onClick={() => {
                const json = buildChoreography({
                  nodes,
                  edges,
                  characters,
                  locations,
                  title: experienceName,
                  description,
                });

                const blob = new Blob([JSON.stringify(json, null, 2)], {
                  type: "application/json",
                });
                const a = document.createElement("a");
                a.href = URL.createObjectURL(blob);
                a.download = `${experienceName}_choreography.json`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(a.href);
              }}
              sx={{
                backgroundColor: tertiaryColor,
                color: textColor,
                fontSize: "20px",
                p: 2,
                borderRadius: 3,
                m: 1,
              }}
            >
              Exportar Choreografia
            </ButtonBase>

          </Box>
        </Box>
      </Box>
    </Dialog>
  );
}

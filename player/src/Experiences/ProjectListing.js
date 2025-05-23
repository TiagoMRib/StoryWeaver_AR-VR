import {
  Box,
  Chip,
  Collapse,
  Grid,
  Icon,
  IconButton,
  Typography,
} from "@mui/material";

import React from "react";
import { tertiaryColor, textColor } from "../themes";

export default function ProjectListing(props) {
  const project = props.project;
  const setExperience = props.setExperience;
  const [open, setOpen] = React.useState(false);

  console.log("[Listing] Project:", project);

  // Add validation logs
  React.useEffect(() => {
    console.log("[Listing] Description:",project.description);
    console.log("[Listing] Tags:", project.tags);
    if (!Array.isArray(project.tags)) {
      console.error("[Listing] ERROR: project.tags is not an array!", project.tags);
    } else {
      project.tags.forEach((tag, index) => {
        console.log(`[Listing] Tag[${index}]`, tag, "name:", tag.name, "color:", tag.color);
        if (typeof tag !== "object" || !tag.name || !tag.color) {
          console.error("[Listing] ERROR: Invalid tag object!", tag);
        }
      });
    }
  }, [project]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "start", alignItems: "start" }}>
      <Box sx={{ display: "flex", flexDirection: "row", alignItems: "center", cursor: "pointer", width: "100%" }}>
        <Box
          sx={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center" }}
          onClick={() => {
            setExperience(project.id);
            localStorage.setItem("storyId", project.id);
          }}
        >
          <img
            src={"../assets/play_svg.svg"}
            alt={project.title}
            style={{
              width: "30px",
              filter: "brightness(0) saturate(100%)",
            }}
          />
          <Typography variant="h5" sx={{ color: "black", px: 3, textAlign: "start" }}>
            {project.experienceName}
          </Typography>
        </Box>
        <IconButton
          onClick={(e) => {
            e.stopPropagation();
            setOpen(!open);
          }}
        >
          <Icon sx={{ color: "black", fontSize: "30px !important" }}>
            {open ? "expand_less" : "expand_more"}
          </Icon>
        </IconButton>
      </Box>

      <Collapse in={open}>
        <Box sx={{ display: "flex", flexDirection: "row", alignItems: "center", mb: 2 }}>
          <Typography
            variant="h6"
            sx={{
              color: textColor,
              backgroundColor: tertiaryColor,
              borderRadius: 2,
              px: 3,
              py: 1,
              mr: 2,
              textAlign: "start",
            }}
          >
            Descrição
          </Typography>

          {/* Defensive check for description */}
          <Typography
            variant="h7"
            sx={{
              color: "black",
              backgroundColor: textColor,
              borderRadius: 2,
              py: 1,
              fontSize: 18,
              px: 3,
              textAlign: "justify",
              whiteSpace: "pre-wrap",
            }}
          >
            {typeof project.description === "string" ? project.description : "Descrição inválida"}
          </Typography>
        </Box>

        <Box sx={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
          <Typography
            variant="h6"
            sx={{
              color: textColor,
              backgroundColor: tertiaryColor,
              borderRadius: 2,
              px: 3,
              py: 1,
              mr: 2,
            }}
          >
            Etiquetas:
          </Typography>

          <Grid>
            {Array.isArray(project.tags)
              ? project.tags.map((tag, i) => {
                  return (
                    <Chip
                      key={`${tag.name}-${i}`}
                      label={tag.name}
                      sx={{
                        fontSize: 16,
                        fontWeight: 500,
                        backgroundColor: tag.color,
                        color: "black",
                        m: 0.5,
                      }}
                    />
                  );
                })
              : "Etiquetas inválidas"}
          </Grid>
        </Box>
      </Collapse>
    </Box>
  );
}

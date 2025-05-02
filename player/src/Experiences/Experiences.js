import { Box, IconButton, TextField, Typography } from "@mui/material";
import React, { useEffect } from "react";
import { backgroundColor, textColor } from "../themes";
import { ApiDataRepository } from "../api/ApiDataRepository";
import { ComponentState } from "../models/ComponentState";
import ExperiencesSelect from "./ExperiencesSelect";
import ExperiencePlay from "./ExperiencePlay";

export default function ExperiencesWindow(props) {
  const experience = props.activeExperience;
  const setExperience = props.setExperience;

  return (
    <Box>
      {experience === undefined ? (
        <ExperiencesSelect setExperience={setExperience} />
      ) : typeof experience === "object" ? (
        <ExperiencePlay
          projectData={experience}
          setExperience={setExperience}
        />
      ) : (
        <ExperiencePlay
          projectId={experience}
          setExperience={setExperience}
        />
      )}
    </Box>
  );
}

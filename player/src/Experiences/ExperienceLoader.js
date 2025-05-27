import React, { useEffect, useState } from "react";
import { Typography, Box } from "@mui/material";
import { ComponentState } from "../models/ComponentState";
import ExperienceView from "./ExperienceView";

export default function ExperienceLoader({
  projectId,
  passedProjectData,
  setExperience,
  playMode,
  glbUrl
}) {
  const [projectInfo, setProjectInfo] = useState(undefined);
  const [currentNode, setCurrentNode] = useState(undefined);
  const [nextNodes, setNextNodes] = useState([]);
  const [componentState, setComponentState] = useState(ComponentState.LOADING);

  // Load project from props or backend (fallback)
  useEffect(() => {
    if (!playMode) return;

    if (passedProjectData) {
      console.log("[Loader] Using passed JSON project data");
      initialize(passedProjectData);
    } else {
      console.error("[Loader] No local project data found. This path is deprecated.");
      setComponentState(ComponentState.ERROR);
    }
  }, [playMode]);

  // Initialize story
  const initialize = (project) => {
    const beginNode = project.story?.find((n) => n.action === "begin");

    if (!beginNode) {
      console.error("[Loader] No 'begin' action found.");
      setComponentState(ComponentState.ERROR);
      return;
    }

    setProjectInfo(project);
    setCurrentNode(beginNode);
    updateNextNodes(beginNode, project);
    setComponentState(ComponentState.LOADED);
  };

  // Determine next nodes 
  const updateNextNodes = (node, project) => {
    if (!node || !project) return;

    let targets = [];

    if (node.action === "choice") {
      targets = node.data.options.map((opt) =>
        project.story.find((n) => n.id === opt.goToStep)
      ).filter(Boolean);
    } else {
      const nextEdges = project.edges?.filter((e) => e.source === node.id) || [];
      targets = project.story.filter((n) =>
        nextEdges.some((e) => e.target === n.id)
      );
    }

    console.log("[Loader] Next nodes for", node.id, ":", targets.map((n) => n.id));
    setNextNodes(targets);
  };

  const setNextNode = (node) => {
    console.log("[Loader] Moving to node:", node?.id);
    if (!projectInfo || !node) return;
    setCurrentNode(node);
    updateNextNodes(node, projectInfo);
  };

  if (componentState === ComponentState.LOADING) return <LoadingScreen />;
  if (componentState === ComponentState.ERROR) return <ErrorScreen />;

  return (
    <ExperienceView
      playMode={playMode}
      glbUrl={glbUrl}
      projectInfo={projectInfo}
      currentNode={currentNode}
      nextNodes={nextNodes}
      setCurrentNode={setCurrentNode}
      setNextNodes={setNextNode}
      setExperience={setExperience}
      repo={null} // Not needed in local mode
    />
  );
}

// UI helpers
const LoadingScreen = () => (
  <Box sx={centerStyle}>
    <Typography variant="h4">Carregando...</Typography>
  </Box>
);

const ErrorScreen = () => (
  <Box sx={centerStyle}>
    <Typography variant="h4">Erro ao carregar</Typography>
  </Box>
);

const centerStyle = {
  width: "100%",
  height: "100%",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

import React, { useEffect, useState } from "react";
import { Typography, Box } from "@mui/material";
import { ApiDataRepository } from "../api/ApiDataRepository";
import { NodeType } from "../models/NodeTypes";
import { ComponentState } from "../models/ComponentState";
import ExperienceView from "./ExperienceView";

export default function ExperienceLoader({ projectId, passedProjectData, setExperience, playMode, glbUrl }) {
  const repo = ApiDataRepository.getInstance();

  const [projectInfo, setProjectInfo] = useState(undefined);
  const [currentNode, setCurrentNode] = useState(undefined);
  const [nextNodes, setNextNodes] = useState([]);
  const [componentState, setComponentState] = useState(ComponentState.LOADING);

  // Fetches project data on play mode selection
  useEffect(() => {
    if (!playMode) return;

    if (passedProjectData) {
      console.log("[Loader] Using passed JSON project data");
      initialize(passedProjectData);
    } else {
      console.log("[Loader] Fetching project from backend");
      repo.getProject(projectId)
        .then(initialize)
        .catch((err) => {
          console.error("[Loader] Failed to load project:", err);
          setComponentState(ComponentState.ERROR);
        });
    }
  }, [playMode]);

  // Initializes the first node in the story
  const initialize = (project) => {
    const beginNode = project.nodes.find((n) => n.type === NodeType.beginNode);
    if (!beginNode) {
      console.error("[Loader] No beginNode found.");
      setComponentState(ComponentState.ERROR);
      return;
    }
    setProjectInfo(project);
    setCurrentNode(beginNode);
    updateNextNodes(beginNode, project);
    setComponentState(ComponentState.LOADED);
  };

  // Computes possible next nodes
  const updateNextNodes = (node, project) => {
    if (!node || !project) return;
    const edges = project.edges.filter((e) => e.source === node.id);
    const targets = project.nodes.filter((n) => edges.some((e) => e.target === n.id));
    console.log("[Loader] Next nodes for", node.id, ":", targets.map((n) => n.id));
    setNextNodes(targets);
  };

  // Moves to the selected node
  const setNextNode = (node) => {
    console.log("[Loader] Moving to node:", node?.id);
    if (!projectInfo || !node) return;
    setCurrentNode(node);
    updateNextNodes(node, projectInfo);
  };

  // Displays loading or error
  if (componentState === ComponentState.LOADING) {
    return <LoadingScreen />;
  }

  if (componentState === ComponentState.ERROR) {
    return <ErrorScreen />;
  }

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
      repo={repo}
    />
  );
}

// Extracted components for readability
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

import {
  Box,
  ButtonBase,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";
import React, { useEffect } from "react";
import { ApiDataRepository } from "../api/ApiDataRepository";
import { ComponentState } from "../models/ComponentState";

import VRExperiencePlayer from "./VRExperiencePlayer";

//Nodes
import { NodeType } from "../models/NodeTypes";
import EndNodeDisplay from "./NodesDisplay/EndNodeDisplay";
import BeginNodeDisplay from "./NodesDisplay/BeginNodeDisplay";
import QuizNodeDisplay from "./NodesDisplay/QuizNodeDisplay";
import VideoNodeDisplay from "./NodesDisplay/VideoNodeDisplay";
import ImageNodeDisplay from "./NodesDisplay/ImageNodeDisplay";
import ThreeDModelDisplay from "./NodesDisplay/ThreeDModelDisplay";
import DialogueNodeDisplay from "./NodesDisplay/DialogueNodeDisplay";
import AudioNodeDisplay from "./NodesDisplay/AudioNodeDisplay";
import PathNodeDisplay from "./NodesDisplay/PathNodeDisplay";
import TextNodeDisplay from "./NodesDisplay/TextNodeDisplay";

export default function ExperiencePlay(props) {
  const repo = ApiDataRepository.getInstance();
  const projectId = props.projectId;
  const passedProjectData = props.projectData;

  const setExperience = props.setExperience;
  const [playMode, setPlayMode] = React.useState(undefined);
  const [vrStage, setVrStage] = React.useState("select"); // "select" | "upload" | "play"
  const [gltfUrl, setGltfUrl] = React.useState(null);


  const [currentNode, setCurrentNode] = React.useState(undefined);
  const [nextNodes, setNextNodes] = React.useState([]);
  const [projectInfo, setProjectInfo] = React.useState(undefined);

  const [componentState, setComponentState] = React.useState(
    ComponentState.LOADING
  );

  useEffect(() => {
    if (!playMode) return;
  
    if (passedProjectData) {
      console.log("[DEBUG] Using local JSON project data");
      setProjectInfo(passedProjectData);
      const beginNode = passedProjectData.nodes.find((node) => node.type === NodeType.beginNode);
      if (!beginNode) {
        console.error("[ERROR] No beginNode found in local JSON");
        setComponentState(ComponentState.ERROR);
        return;
      }
      setCurrentNode(beginNode);
      setComponentState(ComponentState.LOADED);
      return;
    }
  
    repo
      .getProject(projectId)
      .then((project) => {
        setProjectInfo(project);
        const beginNode = project.nodes.find((node) => node.type === NodeType.beginNode);
        if (!beginNode) {
          console.error("[ERROR] No beginNode found in backend project");
          setComponentState(ComponentState.ERROR);
          return;
        }
        setCurrentNode(beginNode);
        setComponentState(ComponentState.LOADED);
      })
      .catch((error) => {
        console.error("[ERROR] Failed to load project:", error);
        setComponentState(ComponentState.ERROR);
      });
  }, [playMode]);

  useEffect(() => {
    if (currentNode === undefined) {
      return;
    }

    setNextNode(currentNode);
  }, [currentNode]);
  const setNextNode = (node) => {
    const edgesFromCurrentNode = projectInfo.edges.filter(
      (edge) => edge.source == currentNode.id
    );
    setNextNodes(
      projectInfo.nodes.filter((node) =>
        edgesFromCurrentNode.find((edge) => edge.target == node.id)
      )
    );

    setCurrentNode(node);
  };

  console.log(currentNode);

  return !playMode ? (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Typography variant="h4" sx={{ mb: 3 }}>
        Escolha o modo:
      </Typography>
      <ButtonBase
        onClick={() => setPlayMode("AR")}
        sx={{
          backgroundColor: "#4caf50",
          color: "white",
          fontSize: "20px",
          p: 2,
          borderRadius: 3,
          mb: 2,
        }}
      >
        AR
      </ButtonBase>
      <ButtonBase
        onClick={() => {
          setPlayMode("VR");
          setVrStage("upload");
        }}
        sx={{
          backgroundColor: "#2196f3",
          color: "white",
          fontSize: "20px",
          p: 2,
          borderRadius: 3,
        }}
      >
        VR
      </ButtonBase>
    </Box>
  ) : componentState === ComponentState.ERROR ? (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Typography variant="h4">Erro ao carregar</Typography>
    </Box>
  ) : playMode === "VR" && vrStage === "upload" ? (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Typography variant="h5" sx={{ mb: 2 }}>
        Faça upload do seu ficheiro .glb:
      </Typography>
  
      <input
        type="file"
        accept=".glb,.gltf"
        onChange={(e) => {
          const file = e.target.files[0];
          if (!file) return;
  
          const url = URL.createObjectURL(file);
          setGltfUrl(url); // Save to state
          setVrStage("play"); // Move to experience
        }}
      />
  
      <Typography sx={{ mt: 2 }} variant="body2">
        O ficheiro deve conter os mesmos nomes dos objetos do JSON para funcionar corretamente.
      </Typography>
    </Box>): componentState === ComponentState.LOADING ? (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Typography variant="h4">Carregando...</Typography>
    </Box>
  ) : playMode === "VR" && vrStage === "play" ? (
    <VRExperiencePlayer
    gltfUrl={gltfUrl}
    projectData={projectInfo} 
    locations={projectInfo?.locations}
    actors={projectInfo?.actors}
    storyNodes={projectInfo?.nodes}
    setNextNode={setNextNode}
    />) : (
    <Box
      key={currentNode.id}
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {currentNode.type == NodeType.beginNode ? (
        <BeginNodeDisplay
          node={currentNode}
          possibleNextNodes={nextNodes}
          setNextNode={setCurrentNode}
          experienceName={projectInfo.experienceName}
        ></BeginNodeDisplay>
      ) : currentNode.type == NodeType.endNode ? (
        <EndNodeDisplay
          node={currentNode}
          setNextNode={() => {
            repo
              .markEndingObtained(
                projectId,
                currentNode.data.id,
                projectInfo.experienceName,
                projectInfo.storyEndings
              )
              .then((res) => {
                console.log(res);
                setExperience(undefined);
              })
              .catch((e) => {
                console.log(e);
              });
          }}
          experienceName={projectInfo.title}
        ></EndNodeDisplay>
      ) : currentNode.type == NodeType.videoNode ? (
        <VideoNodeDisplay
          node={currentNode}
          possibleNextNodes={nextNodes}
          setNextNode={setCurrentNode}
          experienceName={projectInfo.title}
        ></VideoNodeDisplay>
      ) : currentNode.type == NodeType.imageNode ? (
        <ImageNodeDisplay
          node={currentNode}
          possibleNextNodes={nextNodes}
          setNextNode={setCurrentNode}
        ></ImageNodeDisplay>
      ) : currentNode.type == NodeType.quizNode ? (
        <QuizNodeDisplay
          node={currentNode}
          outGoingEdges={projectInfo.edges.filter(
            (edge) => edge.source == currentNode.id
          )}
          possibleNextNodes={nextNodes}
          setNextNode={setCurrentNode}
        ></QuizNodeDisplay>
      ) : currentNode.type == NodeType.threeDModelNode ? (
        <ThreeDModelDisplay
          node={currentNode}
          possibleNextNodes={nextNodes}
          setNextNode={setCurrentNode}
        ></ThreeDModelDisplay>
      ) : currentNode.type == NodeType.characterNode ? (
        <DialogueNodeDisplay
          node={currentNode}
          possibleNextNodes={nextNodes}
          setNextNode={setCurrentNode}
          outGoingEdges={projectInfo.edges.filter(
            (edge) => edge.source == currentNode.id
          )}
        ></DialogueNodeDisplay>
      ) : currentNode.type == NodeType.audioNode ? (
        <AudioNodeDisplay
          node={currentNode}
          possibleNextNodes={nextNodes}
          setNextNode={setCurrentNode}
        ></AudioNodeDisplay>
      ) : currentNode.type == NodeType.pathNode ? (
        <PathNodeDisplay
          node={currentNode}
          possibleNextNodes={nextNodes}
          setNextNode={setCurrentNode}
        ></PathNodeDisplay>
      ) : currentNode.type == NodeType.textNode ? (
        <TextNodeDisplay
          node={currentNode}
          possibleNextNodes={nextNodes}
          setNextNode={setCurrentNode}
        ></TextNodeDisplay>
      ) : (
        <Box>
          <p>Node type not supported</p>
          <ButtonBase
            onClick={() => {
              setCurrentNode(
                projectInfo.nodes.find(
                  (node) => node.type == NodeType.beginNode
                )
              );
            }}
          >
            <Typography variant="h4">Voltar ao inicio</Typography>
          </ButtonBase>
        </Box>
      )}
    </Box>
  );
}

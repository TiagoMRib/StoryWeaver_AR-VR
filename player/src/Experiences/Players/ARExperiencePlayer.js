import React from "react";
import { Box, ButtonBase, Typography } from "@mui/material";
import { NodeType } from "../../models/NodeTypes";

import BeginNodeDisplay from "../NodesDisplay/BeginNodeDisplay";
import EndNodeDisplay from "../NodesDisplay/EndNodeDisplay";
import QuizNodeDisplay from "../NodesDisplay/QuizNodeDisplay";
import VideoNodeDisplay from "../NodesDisplay/VideoNodeDisplay";
import ImageNodeDisplay from "../NodesDisplay/ImageNodeDisplay";
import ThreeDModelDisplay from "../NodesDisplay/ThreeDModelDisplay";
import DialogueNodeDisplay from "../NodesDisplay/DialogueNodeDisplay";
import AudioNodeDisplay from "../NodesDisplay/AudioNodeDisplay";
import PathNodeDisplay from "../NodesDisplay/PathNodeDisplay";
import TextNodeDisplay from "../NodesDisplay/TextNodeDisplay";

export default function ARExperiencePlayer({
  currentNode,
  nextNodes,
  projectInfo,
  setCurrentNode,
  setExperience,
  repo,
}) {
  const renderNode = () => {
    console.log("[ARPlayer] Rendering node:", currentNode);
    switch (currentNode.type) {
      case NodeType.beginNode:
        return (
          <BeginNodeDisplay
            node={currentNode}
            possibleNextNodes={nextNodes}
            setNextNode={setCurrentNode}
            experienceName={projectInfo.experienceName}
          />
        );
      case NodeType.endNode:
        return (
          <EndNodeDisplay
            node={currentNode}
            setNextNode={() => {
              repo
                .markEndingObtained(
                  projectInfo.id,
                  currentNode.data.id,
                  projectInfo.experienceName,
                  projectInfo.storyEndings
                )
                .then(() => setExperience(undefined))
                .catch(console.log);
            }}
            experienceName={projectInfo.title}
          />
        );
      case NodeType.videoNode:
        return (
          <VideoNodeDisplay
            node={currentNode}
            possibleNextNodes={nextNodes}
            setNextNode={setCurrentNode}
            experienceName={projectInfo.title}
          />
        );
      case NodeType.imageNode:
        return (
          <ImageNodeDisplay
            node={currentNode}
            possibleNextNodes={nextNodes}
            setNextNode={setCurrentNode}
          />
        );
      case NodeType.quizNode:
        return (
          <QuizNodeDisplay
            node={currentNode}
            outGoingEdges={projectInfo.edges.filter(
              (edge) => edge.source === currentNode.id
            )}
            possibleNextNodes={nextNodes}
            setNextNode={setCurrentNode}
          />
        );
      case NodeType.threeDModelNode:
        return (
          <ThreeDModelDisplay
            node={currentNode}
            possibleNextNodes={nextNodes}
            setNextNode={setCurrentNode}
          />
        );
      case NodeType.characterNode:
        return (
          <DialogueNodeDisplay
            node={currentNode}
            possibleNextNodes={nextNodes}
            setNextNode={setCurrentNode}
            outGoingEdges={projectInfo.edges.filter(
              (edge) => edge.source === currentNode.id
            )}
          />
        );
      case NodeType.audioNode:
        return (
          <AudioNodeDisplay
            node={currentNode}
            possibleNextNodes={nextNodes}
            setNextNode={setCurrentNode}
          />
        );
      case NodeType.pathNode:
        return (
          <PathNodeDisplay
            node={currentNode}
            possibleNextNodes={nextNodes}
            setNextNode={setCurrentNode}
          />
        );
      case NodeType.textNode:
        return (
          <TextNodeDisplay
            node={currentNode}
            possibleNextNodes={nextNodes}
            setNextNode={setCurrentNode}
          />
        );
      default:
        return (
          <Box>
            <p>Node type not supported</p>
            <ButtonBase
              onClick={() => {
                const beginNode = projectInfo.nodes.find(
                  (node) => node.type === NodeType.beginNode
                );
                if (beginNode) setCurrentNode(beginNode);
              }}
            >
              <Typography variant="h4">Voltar ao início</Typography>
            </ButtonBase>
          </Box>
        );
    }
  };

  return (
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
      {renderNode()}
    </Box>
  );
}

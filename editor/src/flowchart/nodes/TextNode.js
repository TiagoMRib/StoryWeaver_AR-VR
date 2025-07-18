import { Box, Icon, IconButton, TextField, Typography } from "@mui/material";
import { Handle, Position, useReactFlow } from "reactflow";
import {
  leftNodeHandleStyle,
  rightNodeHandleStyle,
  primaryColor,
  secondaryColor,
  tertiaryColor,
  textColor,
} from "../../themes";
import React, { useEffect } from "react";
import { ApiDataRepository } from "../../api/ApiDataRepository";
import PlayerTextFinalDisplay from "./util/PlayerTextFinalDisplay";
import { DescriptionSharp } from "@mui/icons-material";
import CharacterIconDisplay from "./util/CharacterIconDisplay";
import { narrator } from "../../data/narrator";

export default function TextNode(props) {
  const repo = ApiDataRepository.getInstance();
  const text = props.data?.name ?? "";
  const isAR = props.data?.ar ?? false;
  const character = props.data?.character ?? narrator;
  const color = props.data?.color ?? "#000000";
  const backgroundFileInfo = props.data?.background ?? "";
  const [backgroundURL, setBackgroundURL] = React.useState("");
  const isSelectedForCopy = props.data?.isSelectedForCopy ?? false;
  const reactflow = useReactFlow();

  const sceneName = props.data?.sceneName ?? "Imagem";
  const nodeId = props.id;
  const setSceneName = (sceneName) => {
    const newNodes = reactflow.getNodes().map((node) => {
      if (node.id === nodeId) {
        return { ...node, data: { ...node.data, sceneName: sceneName } };
      }
      return node;
    });
    reactflow.setNodes(newNodes);
    localStorage.setItem("nodes", JSON.stringify(newNodes));
  };

  const [backgroundColor, setBackgroundColor] = React.useState("#A9B388");

  const [characterFilepath, setCharacterFilepath] = React.useState("");
  useEffect(() => {
    if (character && character.image.inputType === "file") {
      repo
        .getFilePath(character.image.filename)
        .then((filepath) => {
          setCharacterFilepath(filepath);
        })
        .catch(() =>
          setCharacterFilepath("../assets/character_dialogue_node.png")
        );
    } else {
      setCharacterFilepath(character.image.filename);
    }
  }, [character]);
  useEffect(() => {
    if (backgroundFileInfo.inputType == "color") {
      setBackgroundURL("");
      setBackgroundColor(backgroundFileInfo.color);
      return;
    }
    if (backgroundFileInfo.filename == "") {
      setBackgroundURL("");
      return;
    }
    if (backgroundFileInfo.inputType == "url") {
      setBackgroundURL(backgroundFileInfo.filename);
    } else {
      repo
        .getFilePath(backgroundFileInfo.filename)
        .then((url) => {
          setBackgroundURL(url);
        })
        .catch(() => {
          setBackgroundURL("");
        });
    }
  }, [backgroundFileInfo]);

  return (
    <>
      <Handle
        type="target"
        position={Position.Left}
        style={
          isSelectedForCopy
            ? { ...leftNodeHandleStyle, left: "5px" }
            : leftNodeHandleStyle
        }
      />
      <Handle
        type="source"
        position={Position.Right}
        style={
          isSelectedForCopy
            ? { ...rightNodeHandleStyle, right: "5px" }
            : rightNodeHandleStyle
        }
      />
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-around",
        }}
      >
        <img
          src={"./assets/text_node.png"}
          style={{
            width: "50px",
            height: "50px",
          }}
        ></img>

        <TextField
          id="scene-name"
          variant="outlined"
          value={sceneName}
          onChange={(e) => {
            setSceneName(e.target.value);
          }}
          inputProps={{
            style: {
              borderRadius: 0,
              color: "black",
              height: 40,
              padding: "0 10px",
              margin: 0,
              borderColor: "transparent",
              borderWidth: 0,
              fontSize: 20,
              fontWeight: 500,
              borderRadius: 10,
            },
          }}
          sx={{
            flexGrow: 1,
            py: 0,
            px: 2,
            color: textColor,

            borderRadius: 0,
            ".MuiInputBase-root": {
              borderRadius: 2,
            },
          }}
        />

        <IconButton sx={{ color: tertiaryColor }} onClick={() => {}}>
          <Icon id="deleteButton" sx={{ fontSize: "40px !important" }}>
            delete
          </Icon>
        </IconButton>
      </Box>
      <div className={isSelectedForCopy ? "border" : ""}>
        <Box
          sx={{
            background: isAR
              ? `url(${"../assets/night_sky.jpg"}) no-repeat center center fixed`
              : backgroundURL == ""
              ? backgroundColor
              : `${backgroundColor} url(${backgroundURL}) no-repeat center center  fixed`,
            backgroundSize: "cover",
            borderColor: "black",
            borderWidth: 2,
            borderRadius: 4,
            borderStyle: "solid",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: "375px",
            minHeight: "677px",
          }}
        >
          {text == "" ? null : (
            <CharacterIconDisplay
              characterName={character.name}
              characterFilepath={characterFilepath}
            />
          )}
          <Icon
            sx={{
              color: textColor,
              fontSize: "50px !important",
              position: "absolute",
              bottom: 5,
              right: 20,
            }}
          >
            {"landscape"}
          </Icon>
          <PlayerTextFinalDisplay
            style={{
              color: color + " !important",
            }}
            text={text}
            messageType={"Mensagem"}
            titleIcon={
              <DescriptionSharp
                sx={{ color: textColor, fontSize: "40px !important" }}
              ></DescriptionSharp>
            }
          />
        </Box>
      </div>
    </>
  );
}

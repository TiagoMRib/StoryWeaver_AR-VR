import React, { useState } from "react";
import Box from "@mui/material/Box";
import Flow from "../flowchart/Flow";
import L from "leaflet";
import { IconButton, Typography } from "@mui/material";
import {
  primaryColor,
  secondaryColor,
  tertiaryColor,
  textColor,
} from "../themes";
import { NodeType } from "../models/NodeTypes";

import TopAppBar from "./AppBar";
import MapWindow from "../map/MapWindow";
import ARMarkerManager from "../map/ARMarkerManager";
import VRWorldWindow from "../world/VRWorldWindow";
import ARWorldWindow from "../world/ARWorldWindow";
import maps from "../data/maps";
import DialogueTree from "../dialogue_tree/DialogueTree";
import { CloseOutlined } from "@mui/icons-material";
import { DialogNodeType } from "../models/DialogNodeTypes";
import { ApiDataRepository } from "../api/ApiDataRepository";
import { narrator } from "../data/narrator";
import { v4 as uuid } from "uuid";
import { findRemovedIndex, generateInspectorProps } from "../data/utils";
import { defaultNodes } from "../data/defaultNodes";

const defaultNarrator = {
  id: 0,
  name: "Narrador",
  description: "O narrador da história",
  image: {
    inputType: "url",
    filename: "../assets/character_dialogue_node.png",
    blob: null,
  },
};

const initialNodes = JSON.parse(
  localStorage.getItem("nodes") || JSON.stringify(defaultNodes)
);
const initialEdges = JSON.parse(localStorage.getItem("edges") || "[]");

export default function MainWindow(props) {
  const repo = ApiDataRepository.getInstance();
  const [windows, setWindows] = React.useState(["História", "Mundo AR", "Mundo VR"]);
  const [mapsState, setMaps] = React.useState(maps);
  
  const [selectedMap, setSelectedMap] = React.useState(
    maps.length > 0 ? maps[0] : null
  );
  const [mountMap, setMountMap] = React.useState(true);


  const [displayedWindow, changeDisplayedWindow] = React.useState("História");
  const [nodes, setNodes] = React.useState(initialNodes);
  const [edges, setEdges] = React.useState(initialEdges);


  const [locations, setLocations] = React.useState(
    JSON.parse(localStorage.getItem("locations")) || []
  );

  const [characters, setCharacters] = React.useState(
    localStorage.getItem("characters")
      ? JSON.parse(localStorage.getItem("characters"))
      : [narrator]
  );

  const [interactions, setInteractions] = React.useState(
    JSON.parse(localStorage.getItem("interactions")) || [
      { type: "talk_to", label: "Falar com" },
      { type: "go_near", label: "Aproximar-se" },
    ]
  );

  // VR mapping
  const [vrActorMapping, setvrActorMapping] = useState({});
  const [vrLocationMapping, setvrLocationMapping] = useState({});

  // AR mapping
  const [arActorMapping, setArActorMapping] = useState({});
  const [arLocationMapping, setArLocationMapping] = useState({});

  //Interaction Mapping
  const [arInteractionMapping, setArInteractionMapping] = useState({});
  const [vrInteractionMapping, setVrInteractionMapping] = useState({});


  const [dialogNodes, setDialogNodes] = React.useState([]);
  const [dialogEdges, setDialogEdges] = React.useState([]);
  const [dialogueNodeId, setDialogueNodeId] = React.useState(null);

  const [projectTitle, setProjectTitle] = React.useState(
    localStorage.getItem("projectTitle") || "Adicione um título ao projeto"
  );

  const [name, setName] = React.useState(
    localStorage.getItem("experienceName") || ""
  );
  const [description, setDescription] = React.useState(
    localStorage.getItem("experienceDescription") || ""
  );
  const [tags, setTags] = React.useState(
    JSON.parse(localStorage.getItem("experienceTags")) || []
  );

  React.useEffect(() => {
    if (displayedWindow.startsWith("Diálogo")) {
      const dialogueName = displayedWindow.substring(8);

      const dialogueNode = nodes.find(
        (node) =>
          node.type == NodeType.characterNode && node.data.name === dialogueName
      );

      setDialogueNodeId(dialogueNode.id);
      setDialogNodes([...dialogueNode.data.dialog.nodes]);
      setDialogEdges([...dialogueNode.data.dialog.edges]);
    } else {
      setDialogueNodeId(null);
      setDialogNodes([]);
      setDialogEdges([]);
    }
  }, [displayedWindow]);

  React.useEffect(() => {
    if (!mountMap) {
      setMountMap(true);
    }
  }, [mountMap]);

  React.useEffect(() => {
    let newNodes = [...nodes];
    for (let i = 0; i < newNodes.length; i++) {
      if (newNodes[i].type == NodeType.characterNode) {
        const dialogNodesWithCharacter = newNodes[i].data.dialog.nodes.filter(
          (node) =>
            node.type == DialogNodeType.dialogNode ||
            node.type == DialogNodeType.dialogChoiceNode
        );
        for (let j = 0; j < dialogNodesWithCharacter.length; j++) {
          const characterInNode = dialogNodesWithCharacter[j].data.character;
          const characterLocal = characters.find(
            (character) => character.id === characterInNode.id
          );
          if (characterLocal) {
            dialogNodesWithCharacter[j].data.character = characterLocal;
          } else {
            dialogNodesWithCharacter[j].data.character = {
              name: "Personagem não encontrado",
              image: {
                inputType: "url",
                filename: "./assets/caution_sign.svg",
              },
            };
          }
        }
      }

      if (newNodes[i].data && newNodes[i].data.character) {
        const character = characters.find(
          (character) => character.id === newNodes[i].data.character.id
        );
        if (character) {
          newNodes[i].data.character = character;
        } else {
          newNodes[i].data.character = {
            name: "Personagem não encontrado",
            image: {
              inputType: "url",
              filename: "./assets/caution_sign.svg",
            },
          };
        }
      }
    }
    setNodes(newNodes);
  }, [characters]);

  const handleLoadServer = async (projectId) => {
    if (projectId == undefined) return;
    try {
      const data = await repo.getProject(projectId);
      console.log("[Data] Loaded project data:", data);
      setNodes(data.nodes);
      setEdges(data.edges);
      setMaps(data.maps);
      setSelectedMap(
        data.maps ? (data.maps.length > 0 ? data.maps[0] : null) : null
      );
      setProjectTitle(data.title);
      setCharacters(data.characters);
      setLocations(data.locations || []);
      setInteractions(data.interactions || []);
      setName(data.experienceName);
      setDescription(data.description);
      setTags(data.tags);
      localStorage.setItem("edges", JSON.stringify(data.edges));
      localStorage.setItem("nodes", JSON.stringify(data.nodes));
      localStorage.setItem("projectTitle", data.title);
      localStorage.setItem("maps", JSON.stringify(data.maps));
      localStorage.setItem("storyId", projectId);
      localStorage.setItem("characters", JSON.stringify(data.characters));
      localStorage.setItem("locations", JSON.stringify(data.locations || []));
      localStorage.setItem("interactions", JSON.stringify(data.interactions || []));
      localStorage.setItem("experienceName", data.experienceName);
      localStorage.setItem("experienceDescription", data.description);
      localStorage.setItem("experienceTags", JSON.stringify(data.tags));
      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  };

  const handleNewProject = async () => {
    setNodes(defaultNodes);
    setEdges([]);
    setMaps([]);
    setCharacters([narrator]);
    setWindows(["História", "Mundo AR", "Mundo VR"]);
    changeDisplayedWindow("História");
    setProjectTitle("Adicione um título ao projeto");
    setName("");
    setDescription("");
    setTags([]);
    localStorage.setItem("edges", JSON.stringify([]));
    localStorage.setItem("nodes", JSON.stringify(defaultNodes));
    localStorage.setItem("maps", JSON.stringify([]));
    localStorage.setItem("exported", false);
    localStorage.setItem("experienceName", "");
    localStorage.setItem("experienceDescription", "");
    localStorage.setItem("experienceTags", JSON.stringify([]));
    localStorage.removeItem("storyId");
    localStorage.setItem("projectTitle", "Adicione um título ao projeto");
    narrator.id = 0;
    narrator.name = defaultNarrator.name;
    narrator.description = defaultNarrator.description;
    narrator.image = defaultNarrator.image;
    localStorage.setItem("characters", JSON.stringify([defaultNarrator]));
    localStorage.setItem("locations", JSON.stringify([]));
    localStorage.setItem("interactions", JSON.stringify([]));
    try {
      const response = await repo.saveProject(
        "Adicone um título ao projeto",
        defaultNodes,
        [],
        [narrator],
        [],
        [],
        []
      );

      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  };

  const handleSaveServer = async () => {
    try {
      const response = await repo.saveProject(
        projectTitle,
        nodes,
        edges,
        characters,
        mapsState,
        locations,
        interactions
        
      );
      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  };

  const addNode = (nodeType, nodeProps) => {
    const newNode = {
      id: uuid(),
      position: {
        x: nodes[nodes.length - 1].position.x + 470,
        y: nodes[nodes.length - 1].position.y,
      },
      data: generateInspectorProps(nodeProps),
      type: nodeType,
    };
    if (newNode.data.sceneName)
      newNode.data.sceneName =
        "Cena " +
        (nodes.filter(
          (node) =>
            node.type !== NodeType.beginNode && node.type !== NodeType.endNode
        ).length +
          1);
    if (localStorage.getItem("scenes")) {
      const scenes = JSON.parse(localStorage.getItem("scenes"));
      scenes[newNode.id] = newNode.data.sceneName;
      localStorage.setItem("scenes", JSON.stringify(scenes));
    } else {
      localStorage.setItem(
        "scenes",
        JSON.stringify({
          [newNode.id]: newNode.data.sceneName,
        })
      );
    }

    setNodes([...nodes, newNode]);
    localStorage.setItem("nodes", JSON.stringify([...nodes, newNode]));
  };

  const addLocation = (selected) => {
    if (!selected || !selectedMap || selectedMap.anchors.length === 0) return;

    const imgCoords = new L.latLng(
      selectedMap.mapSize.height / 2,
      selectedMap.mapSize.width / 2
    );

    const anchors = selectedMap.anchors.filter(
      (anchor) => anchor.anchorType === "anchor"
    );

    const realCoords = {
      lat: imgCoords.lat * selectedMap.scale + anchors[0].coords.lat,
      lng: imgCoords.lng * selectedMap.scale + anchors[0].coords.lng,
    };

    setMountMap(false);

    const newAnchor = {
      anchorId: selectedMap.anchors.length + 1,
      anchorType: selected.markerType || "anchor", // fallback if not defined
      coords: realCoords,
      imgCoords: imgCoords,
      name: selected.name,
      description: selected.description || "",
      locationId: selected.id
    };

    selectedMap.anchors.push(newAnchor);
    setSelectedMap({ ...selectedMap });

    const newMaps = mapsState.filter((map) => map.id !== selectedMap.id);
    newMaps.push(selectedMap);
    setMaps(newMaps);
    localStorage.setItem("maps", JSON.stringify(newMaps));
  };

  const changeOneNode = (nodeId, newNodes, newEdges, oldEndData) => {
    const oldNode = nodes.find((node) => node.id === nodeId);

    if (oldNode.type === NodeType.characterNode && newNodes) {
      const oldDialogNodesEndsNames = oldNode.data.dialog.nodes
        .filter((node) => node.type === DialogNodeType.endDialogNode)
        .map((node) => node.data.id);
      const newDialogNodesEndsNames = newNodes
        .filter((node) => node.type === DialogNodeType.endDialogNode)
        .map((node) => node.data.id);
      if (oldDialogNodesEndsNames.length > newDialogNodesEndsNames.length) {
        const removedIndex = findRemovedIndex(
          oldDialogNodesEndsNames,
          newDialogNodesEndsNames
        );
        const newEdges = edges.filter(
          (edge) =>
            !(
              edge.source == nodeId &&
              edge.sourceHandle == oldDialogNodesEndsNames[removedIndex]
            )
        );
        setEdges(newEdges);

        localStorage.setItem("edges", JSON.stringify(newEdges));
      } else if (
        oldDialogNodesEndsNames.length == newDialogNodesEndsNames.length &&
        oldEndData
      ) {
        const newDialogEndName = newNodes.find(
          (node) => node.id == oldEndData.changedId
        ).data.id;

        const oldEndName = oldEndData.oldEndName;

        const newEdges = edges.map((edge) => {
          if (edge.source == nodeId && edge.sourceHandle == oldEndName) {
            return {
              ...edge,
              sourceHandle: newDialogEndName,
            };
          }

          return edge;
        });
        setEdges(newEdges);

        localStorage.setItem("edges", JSON.stringify(newEdges));
      }
    }

    const newNodess = nodes.map((node) => {
      if (node.id === nodeId) {
        return {
          ...node,
          data: {
            ...node.data,
            dialog: {
              nodes: newNodes != undefined ? newNodes : node.data.dialog.nodes,
              edges: newEdges != undefined ? newEdges : node.data.dialog.edges,
            },
          },
        };
      }
      return node;
    });

    setNodes(newNodess);

    localStorage.setItem("nodes", JSON.stringify(newNodess));
  };
  const addDialogueNode = (nodeType, nodeProps) => {
    if (!(nodeType in DialogNodeType)) return;

    const newNode = {
      id: uuid(),
      position: {
        x: dialogNodes[dialogNodes.length - 1].position.x + 300,
        y: dialogNodes[dialogNodes.length - 1].position.y,
      },
      data: generateInspectorProps(nodeProps),
      type: nodeType,
    };

    changeOneNode(dialogueNodeId, [...dialogNodes, newNode], dialogEdges);
    setDialogNodes([...dialogNodes, newNode]);
  };

  return (
    <>
      <TopAppBar
        name={name}
        setName={setName}
        description={description}
        setDescription={setDescription}
        tags={tags}
        setTags={setTags}

        nodes={nodes}
        selectedMap={selectedMap}
        edges={edges}

        characters={characters}
        setCharacters={setCharacters}

        vrActorMapping={vrActorMapping}
        setVrActorMapping={setvrActorMapping}
        arActorMapping={arActorMapping}
        setArActorMapping={setArActorMapping}

        locations={locations}
        setLocations={setLocations}

        maps={mapsState}
        
        vrLocationMapping={vrLocationMapping}
        setVrLocationMapping={setvrLocationMapping}
        arLocationMapping={arLocationMapping}
        setArLocationMapping={setArLocationMapping}

        interactions={interactions}
        setInteractions={setInteractions}

        vrInteractionMapping={vrInteractionMapping}
        setVrInteractionMapping={setVrInteractionMapping}
        arInteractionMapping={arInteractionMapping}
        setArInteractionMapping={setArInteractionMapping}
        
        
        projectTitle={projectTitle}
        setProjectTitle={setProjectTitle}

        currentWindow={displayedWindow}
        addNode={addNode}
        addDialogueNode={addDialogueNode}
        addLocation={addLocation}
        handleSaveServer={handleSaveServer}
        handleLoadServer={handleLoadServer}
        handleNewProject={handleNewProject}
      ></TopAppBar>
      <Box sx={{ flexGrow: 1, height: '100vh', overflowY: 'auto' }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            p: 0,
            alignItems: "center",
            justifyContent: "left",
            backgroundColor: primaryColor
          }}
        >
          {windows.map((window) => {
            return (
              <Box
                key={window}
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  p: 0,
                  alignItems: "center",
                  justifyContent: "left",
                  backgroundColor: primaryColor,
                }}
              >
                <Box
                  sx={{
                    backgroundColor:
                      displayedWindow === window
                        ? secondaryColor
                        : primaryColor,
                    borderColor: tertiaryColor,
                    borderWidth: 3,
                    borderStyle: "solid",
                    cursor: "pointer",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    display: "flex",
                    m: 0,
                    borderBottomWidth: displayedWindow === window ? 0 : 3,
                  }}
                >
                  <Typography
                    onClick={() => changeDisplayedWindow(window)}
                    variant="h7"
                    component="div"
                    sx={{ flexGrow: 1, py: 1, px: 2, color: textColor, m: 0 }}
                  >
                    {window}
                  </Typography>
                  {window.startsWith("Diálogo") ? (
                    <IconButton
                      sx={{
                        color: textColor,
                        m: 0,
                        p: 0,
                      }}
                      onClick={() => {
                        changeDisplayedWindow("História");
                        setWindows(windows.filter((w) => w !== window));
                      }}
                    >
                      <CloseOutlined></CloseOutlined>
                    </IconButton>
                  ) : null}
                </Box>
              </Box>
            );
          })}

          <Box
            sx={{
              flexGrow: 1,
              height: "-webkit-fill-available",
              m: 0,
              borderColor: tertiaryColor,
              borderWidth: 2,
              borderStyle: "solid",
            }}
          >
            <Typography
              variant="h7"
              component="div"
              sx={{ flexGrow: 1, py: 1, px: 2, color: primaryColor }}
            >
              filler
            </Typography>
          </Box>
        </Box>

        {displayedWindow === "História" ? (
          <Flow
            characters={characters}
            locations={locations}
            interactions={interactions}
            setWindows={setWindows}
            changeDisplayedWindow={changeDisplayedWindow}
            windows={windows}
            changeWindows={setWindows}
            key={"flowchart"}
            nodes={nodes}
            edges={edges}
            setNodes={setNodes}
            setEdges={setEdges}
            setDialogNodes={setDialogNodes}
            setDialogEdges={setDialogEdges}
            setDialogueNodeId={setDialogueNodeId}
          />
        ) : displayedWindow === "Mundo AR" ? (
          <ARWorldWindow
            onSelect={(mode) => {
              if (mode === "map") {
                changeDisplayedWindow("Mapa GPS");
              } else if (mode === "tracking") {
                changeDisplayedWindow("Tracking AR");
              }
            }}
          />        
        ) : displayedWindow === "Mapa GPS" ? (
          mountMap ? (
            <MapWindow
              mapState={mapsState}
              setMaps={setMaps}
              selectedMap={selectedMap}
              setSelectedMap={setSelectedMap}
              locations={locations}
            />
          ) : null
        ) : displayedWindow === "Tracking AR" ? (
          <ARMarkerManager
            characters={characters}
            locations={locations}
            onSave={(type, updatedEntity) => {
              if (type === "location") {
                setLocations(prev => {
                  const updated = prev.map(l => l.id === updatedEntity.id ? updatedEntity : l);
                  localStorage.setItem("locations", JSON.stringify(updated));
                  return updated;
                });
              } else {
                setCharacters(prev => {
                  const updated = prev.map(c => c.id === updatedEntity.id ? updatedEntity : c);
                  localStorage.setItem("characters", JSON.stringify(updated));
                  return updated;
                });
              }
            }}
          />
        ) : displayedWindow.startsWith("Diálogo") ? (
          <DialogueTree
            characters={characters}
            nodes={dialogNodes}
            edges={dialogEdges}
            setEdges={setDialogEdges}
            setNodes={setDialogNodes}
            nodeId={dialogueNodeId}
            applyChanges={changeOneNode}
            key={dialogueNodeId}
          />
        ) : displayedWindow === "Mundo VR" ? (
          <VRWorldWindow
            characters={characters}
            locations={locations}
            setCharacters={setCharacters}
            setLocations={setLocations}
            vrActorMapping={vrActorMapping}
            setvrActorMapping={setvrActorMapping}
            vrLocationMapping={vrLocationMapping}
            setvrLocationMapping={setvrLocationMapping}
          />
        ) : null}

      </Box>
    </>
  );
}

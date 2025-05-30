import {
  Box,
  ButtonBase,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { backgroundColor, secondaryColor, textColor } from "../../themes";
import { ApiDataRepository } from "../../api/ApiDataRepository";
import { ComponentState } from "../../models/ComponentState";
import { AREntityTypes } from "../../models/AREntityTypes";
import ImageTrackingBasedARDisplay from "./ImageTrackingBasedARDisplay";
import LocationBasedARDisplay from "./LocationBasedARDisplay";
import { ARTriggerMode } from "../../models/ARTriggerModes";
import PlayerTextFinalDisplay from "./util/PlayerTextFinalDisplay";
import Typewriter from "./util/TypeWriter";
import { useLocationCheck} from "./util/LocationCheck";
import GoToNextSlideButton from "./util/GoToNextSlideButton";

export default function ImageNodeDisplay(props) {
  const repo = ApiDataRepository.getInstance();
  const imageNode = props.node;
  const title = imageNode.data.name;
  const fileInfo = imageNode.data.file;
  const possibleNextNodes = props.possibleNextNodes;
  const ARTypeInfo = imageNode.data.ar_type;
  const isAR = imageNode.data.ar;
  const position = imageNode.data.position;
  const scale = imageNode.data.scale;
  const rotation = imageNode.data.rotation;
  const setNextNode = props.setNextNode;
  const [url, setUrl] = React.useState("");
  const character = imageNode.data.character;

  const backgroundFileInfo = imageNode.data.background;

  const [backgroundURL, setBackgroundURL] = React.useState("");

  const [componentState, setComponentState] = React.useState(
    ComponentState.LOADING
  );

  const [backgroundColor, setBackgroundColor] = React.useState("#A9B388");

  const [characterImg, setCharacterImg] = React.useState("");

  const [markerSrc, setMarkerSrc] = React.useState("");

  //Location based section
  const isSiteTriggered = props.node.data.isSiteTriggered;
  const siteType = props.node.data.site_type; // Contains map & place
  const [isOnLocation, setIsOnLocation] = useState(!isSiteTriggered); // Default true if not site-triggered
  const [direction, setDirection] = useState(null);

  if (isSiteTriggered) {
    console.log("Site coordinates: ", siteType);
  }
  const distance = useLocationCheck(
    isSiteTriggered ? siteType.map : null,
    isSiteTriggered ? siteType.place : null,
    10, // Distance threshold (adjust as needed)
    setIsOnLocation
  );




  useEffect(() => {
    if (!isAR) return;
    if (ARTypeInfo.trigger_mode == ARTriggerMode.QRCode) {
      repo.getFilePath(ARTypeInfo.qr_code).then((url) => {
        setMarkerSrc(url);
      });
    } else {
      if (ARTypeInfo.image.inputType == "url") {
        setMarkerSrc(ARTypeInfo.image.filename);
      } else {
        repo
          .getFilePath(ARTypeInfo.image.filename.split(".")[0])
          .then((url) => {
            setMarkerSrc(url);
          });
      }
    }
  }, [ARTypeInfo]);

  useEffect(() => {
    if (character.image.filename == "") {
      return;
    }
    if (character.image.inputType == "url") {
      setCharacterImg(character.image.filename);
    } else {
      repo.getFilePath(character.image.filename).then((url) => {
        setCharacterImg(url);
      });
    }
  }, [character]);

  useEffect(() => {
    if (backgroundFileInfo.inputType == "color") {
      setBackgroundColor(backgroundFileInfo.color);
      setBackgroundURL("");
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

  useEffect(() => {
    if (fileInfo.inputType == "file") {
      repo
        .getFilePath(fileInfo.filename)
        .then((path) => {
          setUrl(path);
          setComponentState(ComponentState.LOADED);
        })
        .catch((error) => {
          setComponentState(ComponentState.ERROR);
        });
    } else {
      setUrl(fileInfo.filename);
    }
  }, []);
  return (
    <>
      <style>
        {`
          body {
            overflow: hidden;
          }
        `}
      </style>
      <Box
        sx={{
          width: "100%",
          overflow: "hidden",
          height: isAR ? "100%" : "91vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          background:
            backgroundURL === ""
              ? backgroundColor
              : `${backgroundColor} url(${backgroundURL}) no-repeat center center fixed`,
          backgroundSize: "cover",
        }}
      >
        {componentState === ComponentState.LOADING ? (
          <Typography variant="h4" sx={{ textAlign: "center" }}>
            Loading...
          </Typography>
        ) : componentState === ComponentState.ERROR ? (
          <Typography variant="h4" sx={{ textAlign: "center" }}>
            Error loading
          </Typography>
        ) : !isOnLocation ? (
          <Box
            sx={{
              width: "100%",
              height: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Typography variant="h4" sx={{ textAlign: "center", px: 2 }}>
              Continua em <strong>{siteType.place}</strong>. <br />
              {distance !== null ? (
                <>
                  Está a <strong>{distance.toFixed(2)}</strong> metros do local. <br />
                  {direction ? `Siga para ${direction}.` : "Calculando direção..."}
                </>
              ) : (
                "Calculando distância..."
              )}
            </Typography>
          </Box>
        ) : (
          // MAIN CONTENT RENDERED HERE
          <Box
            sx={{
              width: "100%",
              zIndex: 0,
              backgroundColor: "transparent",
              minHeight: "80vh",
              display: "flex",
              flexDirection: "column",
              justifyContent: isAR ? "start" : "center",
              alignItems: "center",
            }}
          >
            {title !== "" && (
              <>
                <img
                  src={characterImg}
                  alt={character.name}
                  style={{
                    width: "100px",
                    height: "100px",
                    borderRadius: "50%",
                    border: "2px solid black",
                  }}
                />
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: "white",
                    border: "2px solid black",
                    borderRadius: "5px",
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      px: 3,
                      py: 1,
                      fontSize: 20,
                      color: "black",
                      fontWeight: 200,
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    <Typewriter text={title} delay={100} />
                  </Typography>
                </Box>
              </>
            )}
            {isAR ? (
              ARTypeInfo.trigger_mode === ARTriggerMode.GPSCoords ? (
                <LocationBasedARDisplay
                  name={title}
                  src={url}
                  map={ARTypeInfo.map}
                  place={ARTypeInfo.place}
                  tolerance={ARTypeInfo.tolerance}
                  position={position}
                  scale={scale}
                  entityType={AREntityTypes.Image}
                />
              ) : (
                <ImageTrackingBasedARDisplay
                  name={title}
                  markerSrc={markerSrc}
                  src={url}
                  position={position}
                  scale={scale}
                  entityType={AREntityTypes.Image}
                />
              )
            ) : (
              <img
                src={url}
                style={{
                  maxWidth: "90%",
                  height: "auto",
                  maxHeight: "60vh",
                  display: "block",
                }}
              />
            )}
            <GoToNextSlideButton
              currentNode={node}
              onAdvance={() => onNext?.()}
            />
          </Box>
        )}
      </Box>
    </>
  );
  
}

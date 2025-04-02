import {
  Box,
  ButtonBase,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";
import React, { useEffect, useState  } from "react";
import {
  backgroundColor,
  secondaryColor,
  tertiaryColor,
  textColor,
} from "../../themes";
import { ApiDataRepository } from "../../api/ApiDataRepository";
import PlayerTextFinalDisplay from "./util/PlayerTextFinalDisplay";
import { ComponentState } from "../../models/ComponentState";
import { ARTriggerMode } from "../../models/ARTriggerModes";
import Typewriter from "./util/TypeWriter";
import GoToNextSlideButton from "./util/GoToNextSlideButton";
import { useLocationCheck, getDirectionToDestination } from "./util/LocationCheck";

function degreesToRadians(degrees) {
  return (degrees * Math.PI) / 180;
}

function distanceInKmBetweenEarthCoordinates(lat1, lon1, lat2, lon2) {
  var earthRadiusKm = 6371;

  var dLat = degreesToRadians(lat2 - lat1);
  var dLon = degreesToRadians(lon2 - lon1);

  lat1 = degreesToRadians(lat1);
  lat2 = degreesToRadians(lat2);

  var a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusKm * c;
}

export default function PathNodeDisplay(props) {
  const repo = ApiDataRepository.getInstance();
  const pathNode = props.node;
  const name = pathNode.data.name;

  const destination = pathNode.data.destination;

  const tolerance = destination.tolerance;

  const [isOnDestination, setIsOnDestination] = React.useState(false);

  const possibleNextNodes = props.possibleNextNodes;

  const backgroundFileInfo = pathNode.data.background;

  const character = pathNode.data.character;

  const [backgroundURL, setBackgroundURL] = React.useState("");

  const [distance, setDistance] = React.useState(0);

  const [componentState, setComponentState] = React.useState(
    ComponentState.LOADING
  );

  const intervalID = React.useRef([]);
  const setNextNode = props.setNextNode;

  const [characterImg, setCharacterImg] = React.useState("");

  //Location based section
    const isSiteTriggered = props.node.data.isSiteTriggered;
    const siteType = props.node.data.site_type; // Contains map & place
    const [isOnLocation, setIsOnLocation] = useState(!isSiteTriggered); // Default true if not site-triggered
    const [direction, setDirection] = useState(null);
  
    if (isSiteTriggered) {
      console.log("Site coordinates: ", siteType);
    }
    const beginning_distance = useLocationCheck(
      isSiteTriggered ? siteType.map : null,
      isSiteTriggered ? siteType.place : null,
      10, // Distance threshold (adjust as needed)
      setIsOnLocation
    );
  
    useEffect(() => {
        if (isSiteTriggered && siteType.map) {
          getDirectionToDestination(siteType.map.lat, siteType.map.lng, setDirection);
        }
      }, [isSiteTriggered, siteType]);

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
    if (destination.trigger_mode != ARTriggerMode.GPSCoords) return;
    repo
      .getMapPlaceCoords(destination.map, destination.place)
      .then((coords) => {
        intervalID.current.push(
          setInterval(() => {
            navigator.geolocation.getCurrentPosition((position) => {
              const currentCoords = {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
              };

              const distance = distanceInKmBetweenEarthCoordinates(
                currentCoords.lat,
                currentCoords.lng,
                coords.lat,
                coords.lng
              );
              setDistance(distance * 1000);
              console.log("Distance (m): " + distance * 1000);
              if (distance * 1000 < tolerance) {
                setIsOnDestination(true);
              }
            });
          }, 3000)
        );

        setComponentState(ComponentState.LOADED);
      })
      .catch((error) => {
        setComponentState(ComponentState.ERROR);
      });
  }, []);
  const [backgroundColor, setBackgroundColor] = React.useState("#A9B388");

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
      setComponentState(ComponentState.LOADED);
    } else {
      repo
        .getFilePath(backgroundFileInfo.filename)
        .then((url) => {
          setBackgroundURL(url);
          setComponentState(ComponentState.LOADED);
        })
        .catch(() => {
          setBackgroundURL("");
          setComponentState(ComponentState.ERROR);
        });
    }
  }, [backgroundFileInfo]);

  return (
    <Box
      sx={{
        width: "100%",
        height: "91vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        background:
          backgroundURL == ""
            ? backgroundColor
            : `${backgroundColor} url(${backgroundURL}) no-repeat center center  fixed`,
        backgroundSize: "cover",
      }}
    >
      {componentState === ComponentState.LOADING ? (
        <Typography
          variant="h4"
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            height: "100%",
          }}
        >
          Loading...
        </Typography>
      ) : componentState === ComponentState.ERROR ? (
        <Typography
          variant="h4"
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            height: "100%",
          }}
        >
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
                        Está a <strong>{beginning_distance.toFixed(2)}</strong> metros do local. <br />
                        {direction ? `Siga para ${direction}.` : "Calculando direção..."}
                      </>
                    ) : (
                      "Calculando distância..."
                    )}
                  </Typography>
                </Box>
              ) : (
        <>
          {name == "" ? null : (
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
                  <Typewriter text={name} delay={100} />
                </Typography>
              </Box>
            </>
          )}
          {isOnDestination ? (
            <PlayerTextFinalDisplay
              text={"Você chegou ao destino! Pressione o botão para continuar."}
              messageType={"Caminho"}
            ></PlayerTextFinalDisplay>
          ) : (
            <PlayerTextFinalDisplay
              text={"Está a " + distance.toFixed(2) + " metros do destino."}
              messageType={"Caminho"}
            ></PlayerTextFinalDisplay>
          )}
          <GoToNextSlideButton
            possibleNextNodes={possibleNextNodes}
            setNextNode={(node) => {
              intervalID.current.forEach((id) => {
                clearInterval(id);
              });
              setNextNode(node);
            }}
          ></GoToNextSlideButton>
        </>
      )}
    </Box>
  );
}

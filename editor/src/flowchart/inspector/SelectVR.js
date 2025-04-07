import {
    Icon,
    MenuItem,
    Select,
    TextField,
    Typography,
  } from "@mui/material";
  import { Box } from "@mui/system";
  import React from "react";
  import { primaryColor, textColor } from "../../themes";
  
  function SelectVRField(props) {
    const label = props.data.label;
    const conditional = props.conditional == undefined ? true : props.conditional;
    const style = props.style;
    const value = props.value;
    const options = props.data.options;
    const characters = props.characters;
    const handleFieldChange = props.onChange;
  
    const maps = JSON.parse(localStorage.getItem("maps")) || [];
    const [selectedMap, setSelectedMap] = React.useState(
      maps.find((map) => map.name == value.map)
    );
  
    return (
      <Box
        sx={{
          display: conditional ? "flex" : "none",
          width: "100%",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          ...style,
        }}
      >

        <Box sx={{ backgroundColor: primaryColor, width: "100%", mt: 2 }}>
                <Typography variant="h7" component="div" sx={{ py: 1, px: 2, color: textColor, m: 0 }}>
                  {label}
                </Typography>
        </Box>
        <Box
          sx={{
            display: "flex",
            width: "100%",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography
            variant="h7"
            component="div"
            sx={{
              flexGrow: 1,
              py: 1,
              px: 2,
              color: textColor,
              m: 0,
              textAlign: "start",
            }}
          >
            Modo de Acionamento VR
          </Typography>
          <Select
            sx={{
              color: "black",
              backgroundColor: "white",
              padding: 0,
              margin: 0,
              mr: "10px",
              outline: "none",
              height: 40,
              width: "35%",
            }}
            value={value.trigger_mode}
            onChange={(event) => {
              handleFieldChange(props.data.name, {
                ...value,
                trigger_mode: event.target.value,
              });
            }}
          >
            {options.map((option, index) => {
              return (
                <MenuItem sx={{ color: "black" }} key={index} value={option}>
                  {option}
                </MenuItem>
              );
            })}
          </Select>
        </Box>
  
        {value.trigger_mode === "Ao entrar" ? (
          maps.length > 0 ? (
            <Box
              sx={{
                display: "flex",
                width: "100%",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                m: 0,
                mt: 2,
              }}
            >
              <Typography
                variant="h7"
                component="div"
                sx={{ px: 2, color: textColor, m: 0 }}
              >
                O conteúdo será exibido quando o utilizador alcançar o local
                selecionado!
              </Typography>
  
              <Box
                sx={{
                  display: "flex",
                  width: "100%",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  mt: 2,
                }}
              >
                <Typography
                  variant="h7"
                  component="div"
                  sx={{ py: 1, px: 2, color: textColor, m: 0 }}
                >
                  Mapa:
                </Typography>
                <Select
                  sx={{
                    color: "black",
                    backgroundColor: "white",
                    width: "50%",
                    height: 40,
                    padding: 0,
                    margin: 0,
                    mr: "10px",
                  }}
                  value={value.map}
                  onChange={(event) => {
                    handleFieldChange(props.data.name, {
                      ...value,
                      map: event.target.value,
                      place: "",
                    });
                    setSelectedMap(
                      maps.find((map) => map.name == event.target.value)
                    );
                  }}
                >
                  {maps.map((map, index) => (
                    <MenuItem key={index} value={map.name}>
                      {map.name}
                    </MenuItem>
                  ))}
                </Select>
              </Box>
  
              <Box
                sx={{
                  display: "flex",
                  width: "100%",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  mt: 2,
                }}
              >
                <Typography
                  variant="h7"
                  component="div"
                  sx={{ py: 1, px: 2, color: textColor, m: 0 }}
                >
                  Lugar:
                </Typography>
                <Select
                  sx={{
                    color: "black",
                    backgroundColor: "white",
                    width: "50%",
                    height: 40,
                    padding: 0,
                    margin: 0,
                    mr: "10px",
                  }}
                  value={value.place}
                  onChange={(event) => {
                    handleFieldChange(props.data.name, {
                      ...value,
                      place: event.target.value,
                    });
                  }}
                >
                  {selectedMap?.anchors
                    .filter((anchor) => anchor.anchorType !== "anchor")
                    .map((place, index) => (
                      <MenuItem key={index} value={place.name}>
                        <Icon sx={{ fontSize: 20, mr: 1 }}>{place.icon}</Icon>
                        {place.name}
                      </MenuItem>
                    ))}
                </Select>
              </Box>
            </Box>
          ) : (
            <Typography
              variant="h7"
              component="div"
              sx={{
                py: 1,
                px: 2,
                color: "black",
                m: 0,
                fontSize: 18,
                fontWeight: "bold",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Icon>warning</Icon>Nenhum mapa disponível - Adicione um mapa na aba
              'Mapa'!
            </Typography>
          )
        ) : value.trigger_mode === "Ao interagir com ator" ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              width: "100%",
              mt: 2,
            }}
          >
            <Typography
              variant="h7"
              component="div"
              sx={{ px: 2, color: textColor, m: 0 }}
            >
              O conteúdo será exibido ao interagir com o personagem selecionado!
            </Typography>
  
            <Box
              sx={{
                display: "flex",
                width: "100%",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                mt: 2,
              }}
            >
              <Typography
                variant="h7"
                component="div"
                sx={{ py: 1, px: 2, color: textColor, m: 0 }}
              >
                Personagem:
              </Typography>
              <Select
                sx={{
                  color: "black",
                  backgroundColor: "white",
                  width: "50%",
                  height: 40,
                  padding: 0,
                  margin: 0,
                  mr: "10px",
                }}
                value={value.actor_id}
                onChange={(event) => {
                  handleFieldChange(props.data.name, {
                    ...value,
                    character: event.target.value,
                  });
                }}
              >
                {characters.map((char) => (
                <MenuItem 
                sx={{
                  color: "black",
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "left",
                }} 
                key={char.id} value={char.id}>
                  {char.name}
                </MenuItem> ))}
              </Select>
            </Box>
          </Box>
        ) : null}
      </Box>
    );
  }
  
  export default SelectVRField;
  
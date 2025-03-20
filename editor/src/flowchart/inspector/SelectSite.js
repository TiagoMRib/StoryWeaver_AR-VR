import {
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { Box } from "@mui/system";
import React, { useState } from "react";
import { primaryColor, textColor } from "../../themes";
import { ApiDataRepository } from "../../api/ApiDataRepository";

function SelectSiteField(props) {
  const repo = ApiDataRepository.getInstance();
  const label = props.data.label;
  const conditional = props.conditional == undefined ? true : props.conditional;
  const style = props.style;
  const value = props.value;
  const handleFieldChange = props.onChange;

  const maps = JSON.parse(localStorage.getItem("maps")) || [];
  const [selectedMap, setSelectedMap] = useState(
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

      {maps.length > 0 ? (
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
          <Typography variant="h7" component="div" sx={{ px: 2, color: textColor, m: 0, fontSize: 16, py: 1 }}>
            O conteúdo será acionado quando o utilizador estiver a menos de {value.tolerance} metros do ponto {value.place}.
          </Typography>
          
          {/* Map Selection */}
          <Box sx={{ display: "flex", width: "100%", alignItems: "center", justifyContent: "space-between" }}>
            <Typography variant="h7" sx={{ py: 1, px: 2, color: textColor }}>Mapa:</Typography>
            <Select
              sx={{ color: "black", backgroundColor: "white", width: "50%", height: 40, mr: "10px" }}
              value={value.map}
              onChange={(event) => {
                handleFieldChange(props.data.name, {
                  map: event.target.value,
                  place: value.place,
                  tolerance: value.tolerance,
                });
                setSelectedMap(maps.find((map) => map.name == event.target.value));
              }}
            >
              {maps.map((map, index) => (
                <MenuItem sx={{ color: "black" }} key={index} value={map.name}>{map.name}</MenuItem>
              ))}
            </Select>
          </Box>

          {/* Place Selection */}
          <Box sx={{ display: "flex", width: "100%", alignItems: "center", justifyContent: "space-between", mt: 2 }}>
            <Typography variant="h7" sx={{ py: 1, px: 2, color: textColor }}>Place:</Typography>
            <Select
              sx={{ color: "black", backgroundColor: "white", width: "50%", height: 40, mr: "10px" }}
              value={value.place}
              onChange={(event) => {
                handleFieldChange(props.data.name, {
                  map: value.map,
                  place: event.target.value,
                  tolerance: value.tolerance,
                });
              }}
            >
              {selectedMap?.anchors?.filter(anchor => anchor.anchorType !== "anchor").map((place, index) => (
                <MenuItem sx={{ color: "black" }} key={index} value={place.name}>{place.name}</MenuItem>
              ))}
            </Select>
          </Box>

          {/* Distance Tolerance */}
          <Box sx={{ display: "flex", width: "100%", alignItems: "center", justifyContent: "space-between", mt: 2 }}>
            <Typography variant="h7" sx={{ py: 1, px: 2, color: textColor }}>Tolerância de distância (metros):</Typography>
            <TextField
              inputProps={{ style: { color: "black", height: 40, backgroundColor: "#ffffff", borderRadius: 10 } }}
              sx={{ flexGrow: 1, py: 0, px: 1, color: textColor }}
              variant="outlined"
              value={value.tolerance}
              onChange={(event) => {
                handleFieldChange(props.data.name, {
                  map: value.map,
                  place: value.place,
                  tolerance: event.target.value,
                });
              }}
            />
          </Box>
        </Box>
      ) : (
        <Typography variant="h7" sx={{ py: 1, px: 2, color: "black", fontSize: 18, fontWeight: "bold", display: "flex", justifyContent: "center", alignItems: "center" }}>
          Nenhum mapa disponível - Adicione um mapa na aba 'Mapa'!
        </Typography>
      )}
    </Box>
  );
}

export default SelectSiteField;

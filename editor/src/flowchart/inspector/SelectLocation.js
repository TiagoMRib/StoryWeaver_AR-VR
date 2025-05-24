import { MenuItem, Select, Typography } from "@mui/material";
import { Box } from "@mui/system";
import React, { useEffect, useState } from "react";
import { primaryColor, textColor } from "../../themes";

function SelectLocationField(props) {
  const label = props.data.label;
  const style = props.style;
  const value = props.value || "Entrada";
  const handleFieldChange = props.onChange;

  const [locations, setLocations] = useState([]);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("locations") || "[]");
    setLocations(stored);
  }, []);

  return (
    <Box
      sx={{
        display: "flex",
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

      {locations.length > 0 ? (
        <Box
          sx={{
            display: "flex",
            width: "100%",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            mt: 2,
          }}
        >
          <Typography
            variant="h7"
            component="div"
            sx={{
              px: 2,
              color: textColor,
              fontSize: 16,
              py: 1,
            }}
          >
            O conteúdo será acionado quando o utilizador estiver em: {value || "nenhum local selecionado"}
          </Typography>

          <Box
            sx={{
              display: "flex",
              width: "100%",
              alignItems: "center",
              justifyContent: "space-between",
              mt: 1,
            }}
          >
            <Typography variant="h7" sx={{ py: 1, px: 2, color: textColor }}>
              Local:
            </Typography>
            <Select
              sx={{
                color: "black",
                backgroundColor: "white",
                width: "50%",
                height: 40,
                mr: "10px",
              }}
              value={value || ""}
              onChange={(event) => {
                handleFieldChange(props.data.name, event.target.value);
              }}
            >
              {locations.map((loc, index) => (
                <MenuItem sx={{ color: "black" }} key={index} value={loc.name}>
                  {loc.name}
                </MenuItem>
              ))}
            </Select>
          </Box>
        </Box>
      ) : (
        <Typography
          variant="h7"
          sx={{
            py: 1,
            px: 2,
            color: "black",
            fontSize: 18,
            fontWeight: "bold",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          Nenhum local disponível - Adicione locais na aba VR ou AR!
        </Typography>
      )}
    </Box>
  );
}

export default SelectLocationField;

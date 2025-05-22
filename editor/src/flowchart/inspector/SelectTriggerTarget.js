import React, { useEffect, useState } from "react";
import { Box } from "@mui/system";
import { Select, MenuItem, Typography } from "@mui/material";
import { primaryColor, textColor } from "../../themes";



function SelectTriggerTargetField(props) {
  const label = props.data.label;
  const conditional = props.conditional ?? true;
  const style = props.style;
  const value = props.value || {};
  const handleFieldChange = props.onChange;

  const [locations, setLocations] = useState([]);
  const [characters, setCharacters] = useState([]);

  useEffect(() => {
    setLocations(JSON.parse(localStorage.getItem("locations") || "[]"));
    setCharacters(JSON.parse(localStorage.getItem("characters") || "[]"));
  }, []);

  const handleTypeChange = (type) => {
    handleFieldChange(props.data.name, {
      type,
      id: "",
      name: "",
    });
  };

  const handleTargetChange = (id, name) => {
    handleFieldChange(props.data.name, {
      ...value,
      id,
      name,
    });
  };

  const options =
    value.type === "enter" ? locations : value.type === "interact" ? characters : [];

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
        <Typography variant="h7" component="div" sx={{ py: 1, px: 2, color: textColor }}>
          {label}
        </Typography>
      </Box>

      {/* Trigger type: enter or interact */}
      <Box
        sx={{
          display: "flex",
          width: "100%",
          alignItems: "center",
          justifyContent: "space-between",
          mt: 2,
        }}
      >
        <Typography variant="h7" sx={{ py: 1, px: 2, color: textColor }}>
          Tipo de gatilho:
        </Typography>
        <Select
          value={value.type || ""}
          onChange={(e) => handleTypeChange(e.target.value)}
          sx={{ width: "50%", backgroundColor: "white", color: "black", mr: 2 }}
        >
          <MenuItem value="enter">Local</MenuItem>
          <MenuItem value="interact">Personagem</MenuItem>
        </Select>
      </Box>

      {/* Trigger target */}
      {value.type && (
        <Box
          sx={{
            display: "flex",
            width: "100%",
            alignItems: "center",
            justifyContent: "space-between",
            mt: 2,
          }}
        >
          <Typography variant="h7" sx={{ py: 1, px: 2, color: textColor }}>
            {value.type === "enter" ? "Local:" : "Personagem:"}
          </Typography>
          <Select
            value={value.id || ""}
            onChange={(e) => {
              const selected = options.find((opt) => opt.id === e.target.value);
              handleTargetChange(selected.id, selected.name);
            }}
            sx={{ width: "50%", backgroundColor: "white", color: "black", mr: 2 }}
          >
            {options.map((opt) => (
              <MenuItem key={opt.id} value={opt.id}>
                {opt.name}
              </MenuItem>
            ))}
          </Select>
        </Box>
      )}
    </Box>
  );
}

export default SelectTriggerTargetField;

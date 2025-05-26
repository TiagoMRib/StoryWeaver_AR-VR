import React from "react";
import { Box } from "@mui/system";
import { Select, MenuItem, Typography } from "@mui/material";
import { primaryColor, textColor } from "../../themes";

function SelectTriggerTargetField(props) {
  const label = props.data.label;
  const conditional = props.conditional ?? true;
  const style = props.style;
  const value = props.value || {};
  const handleFieldChange = props.onChange;

  const locations = props.locations || [];
  const characters = props.characters || [];
  const interactions = props.interactions || [];

  const handleInteractionChange = (type) => {
    handleFieldChange(props.data.name, {
      type,
      targetType: "",
      id: "",
      name: "",
    });
  };

  const handleTargetTypeChange = (targetType) => {
    handleFieldChange(props.data.name, {
      ...value,
      targetType,
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

  const options = value.targetType === "location" ? locations : characters;

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

      {/* 1. Interaction Selection */}
      <Box sx={{ display: "flex", width: "100%", alignItems: "center", justifyContent: "space-between", mt: 2 }}>
        <Typography variant="h7" sx={{ py: 1, px: 2, color: textColor }}>
          Interação:
        </Typography>
        <Select
          value={value.type || ""}
          onChange={(e) => handleInteractionChange(e.target.value)}
          sx={{ width: "50%", backgroundColor: "white", color: "black", mr: 2 }}
        >
          {interactions.map((int) => (
            <MenuItem key={int.type} value={int.type} sx={{ color: "black" }}>
              {int.label}
            </MenuItem>
          ))}
        </Select>
      </Box>

      {/* 2. Target Type */}
      {value.type && (
        <Box sx={{ display: "flex", width: "100%", alignItems: "center", justifyContent: "space-between", mt: 2 }}>
          <Typography variant="h7" sx={{ py: 1, px: 2, color: textColor }}>
            Tipo de alvo:
          </Typography>
          <Select
            value={value.targetType || ""}
            onChange={(e) => handleTargetTypeChange(e.target.value)}
            sx={{ width: "50%", backgroundColor: "white", color: "black", mr: 2 }}
          >
            <MenuItem value="character" sx={{ color: "black" }}>Personagem</MenuItem>
            <MenuItem value="location" sx={{ color: "black" }}>Local</MenuItem>
          </Select>
        </Box>
      )}

      {/* 3. Target Selection */}
      {value.targetType && (
        <Box sx={{ display: "flex", width: "100%", alignItems: "center", justifyContent: "space-between", mt: 2 }}>
          <Typography variant="h7" sx={{ py: 1, px: 2, color: textColor }}>
            {value.targetType === "location" ? "Local:" : "Personagem:"}
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
              <MenuItem key={opt.id} value={opt.id} sx={{ color: "black" }}>
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

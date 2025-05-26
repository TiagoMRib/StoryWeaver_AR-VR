import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  IconButton,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { Box } from "@mui/system";
import React, { useEffect, useState } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import { v4 as uuidv4 } from "uuid";
import { primaryColor, secondaryColor, textColor } from "../../themes";
import { possibleMarkers, MarkerTypes } from "../../models/MarkerTypes";

export default function CreateLocationPopup({ open, onClose, selectedLocation, locations }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [markerType, setMarkerType] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (selectedLocation) {
      setName(selectedLocation.name || "");
      setDescription(selectedLocation.description || "");
      setMarkerType(selectedLocation.markerType || "");
    } else {
      setName("");
      setDescription("");
      setMarkerType("");
    }
    setError("");
  }, [selectedLocation, open]);

  const handleSave = () => {
    if (!name.trim()) {
      setError("O nome do local é obrigatório.");
      return;
    }

    const duplicate = locations.find(
      (loc) => loc.name === name && loc.id !== selectedLocation?.id
    );
    if (duplicate) {
      setError("Já existe um local com este nome.");
      return;
    }

    const location = {
      id: selectedLocation?.id || uuidv4(),
      name,
      description,
      markerType: markerType || undefined, // Optional
    };

    onClose(location);
  };

  const handleDelete = () => {
    if (window.confirm("Tem a certeza que deseja eliminar este local?")) {
      onClose("delete");
    }
  };

  return (
    <Dialog open={open} onClose={() => onClose(undefined)} maxWidth="xs" fullWidth>
      <DialogTitle
        sx={{ backgroundColor: primaryColor, color: textColor, textAlign: "center", fontWeight: "bold" }}
      >
        {selectedLocation ? "Editar Local" : "Novo Local"}
      </DialogTitle>
      <DialogContent sx={{ backgroundColor: secondaryColor }}>
        <TextField
          fullWidth
          label="Nome do Local"
          variant="outlined"
          value={name}
          onChange={(e) => setName(e.target.value)}
          sx={{ mb: 2 }}
          autoFocus
        />
        <TextField
          fullWidth
          multiline
          minRows={3}
          label="Descrição (opcional)"
          variant="outlined"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          sx={{ mb: 2 }}
        />
        <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
          <InputLabel>Tipo (opcional)</InputLabel>
          <Select
            label="Tipo (opcional)"
            value={markerType}
            onChange={(e) => setMarkerType(e.target.value)}
          >
            <MenuItem value="" sx={{color: "black"}}><em>Nenhum</em></MenuItem>
            {possibleMarkers.map((marker) => (
              <MenuItem key={marker.type} value={marker.type} sx={{color: "black"}}>
                {marker.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        {error && (
          <Typography color="error" sx={{ mt: 1 }}>
            {error}
          </Typography>
        )}
      </DialogContent>
      <DialogActions sx={{ backgroundColor: secondaryColor, justifyContent: "space-between" }}>
        {selectedLocation && (
          <IconButton onClick={handleDelete} color="error">
            <DeleteIcon />
          </IconButton>
        )}
        <Box>
          <Button onClick={() => onClose(undefined)} sx={{ color: textColor }}>
            Cancelar
          </Button>
          <Button onClick={handleSave} sx={{ color: primaryColor }}>
            Guardar
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
}

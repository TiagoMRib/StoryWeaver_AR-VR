import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  IconButton,
  Typography,
} from "@mui/material";
import { Box } from "@mui/system";
import React, { useEffect, useState } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import { v4 as uuidv4 } from "uuid";
import { primaryColor, secondaryColor, textColor } from "../../themes";

/**
 * CreateLocationPopup
 * 
 * A modal form to create or edit a location. It accepts initial data
 * and returns the full location object or "delete" on close.
 */
export default function CreateLocationPopup({ open, onClose, selectedLocation, locations }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    // Pre-fill fields if editing an existing location
    if (selectedLocation) {
      setName(selectedLocation.name || "");
      setDescription(selectedLocation.description || "");
    } else {
      setName("");
      setDescription("");
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
        />
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

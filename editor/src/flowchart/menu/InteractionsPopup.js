import { AddCircleOutline, Edit } from "@mui/icons-material";
import {
  Dialog,
  Grid,
  Icon,
  IconButton,
  Typography,
  TextField,
  Box,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
} from "@mui/material";
import * as React from "react";
import { primaryColor, secondaryColor, textColor } from "../../themes";

function EditInteractionPopup({ open, onClose, interaction, onSave }) {
  const [edited, setEdited] = React.useState({ ...interaction });

  const save = () => {
    if (!edited.type || !edited.label) return;
    onSave(edited);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <Box sx={{ p: 4, backgroundColor: secondaryColor }}>
        <Typography variant="h6" sx={{ mb: 2, color: textColor }}>Editar Interação</Typography>
        <TextField
          label="Nome (label)"
          variant="filled"
          value={edited.label}
          onChange={(e) => setEdited({ ...edited, label: e.target.value })}
          sx={{ mb: 2, width: '100%' }}
        />
        <TextField
          label="ID"
          variant="filled"
          value={edited.type}
          onChange={(e) => setEdited({ ...edited, type: e.target.value })}
          sx={{ mb: 2, width: '100%' }}
        />
        <FormControl variant="filled" sx={{ mb: 2, width: '100%' }}>
          <InputLabel>AR Método</InputLabel>
          <Select
            value={edited.methodAr || ''}
            onChange={(e) => setEdited({ ...edited, methodAr: e.target.value })}
          >
            <MenuItem value=""><em>Nenhum</em></MenuItem>
            <MenuItem value="gps" sx={{ color: "black" }}>GPS</MenuItem>
            <MenuItem value="qr_code" sx={{ color: "black" }}>QR Code</MenuItem>
            <MenuItem value="image_tracking" sx={{ color: "black" }}>Image Tracking</MenuItem>
          </Select>
        </FormControl>
        <FormControl variant="filled" sx={{ mb: 2, width: '100%' }}>
          <InputLabel>VR Método</InputLabel>
          <Select
            value={edited.methodVr || ''}
            onChange={(e) => setEdited({ ...edited, methodVr: e.target.value })}
          >
            <MenuItem value=""><em>Nenhum</em></MenuItem>
            <MenuItem value="proximity" sx={{ color: "black" }}>Proximidade</MenuItem>
            <MenuItem value="primary" sx={{ color: "black" }}>Botão primário</MenuItem>
            <MenuItem value="trigger" sx={{ color: "black" }}>Botão Trigger</MenuItem>
          </Select>
        </FormControl>
        <Box sx={{ textAlign: 'right' }}>
          <IconButton onClick={save} sx={{ color: primaryColor }}>
            <Edit />
          </IconButton>
        </Box>
      </Box>
    </Dialog>
  );
}

export default function InteractionsPopup({ open, onClose, interactions, setInteractions }) {
  const [newInteraction, setNewInteraction] = React.useState({ type: "", label: "", methodAr: "", methodVr: "" });
  const [editingIndex, setEditingIndex] = React.useState(-1);

  const addInteraction = () => {
    if (!newInteraction.type || !newInteraction.label) return;
    const updated = [...interactions, { ...newInteraction }];
    setInteractions(updated);
    setNewInteraction({ type: "", label: "", methodAr: "", methodVr: "" });
  };

  const handleDeleteInteraction = (indexToDelete) => {
    const updated = interactions.filter((_, i) => i !== indexToDelete);
    setInteractions(updated);
  };

  const saveEdit = (edited) => {
    const updated = interactions.slice();
    updated[editingIndex] = edited;
    setInteractions(updated);
    setEditingIndex(-1);
  };

  return (
    <>
      <Dialog
        id="interactions-popup"
        open={open}
        onClose={() => onClose()}
        sx={{
          width: "100%",
          scrollbarWidth: "thin",
          scrollbarColor: `${primaryColor} ${secondaryColor}`,
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            backgroundColor: secondaryColor,
            zIndex: 1,
            m: "0 auto",
            px: 6,
            py: 4,
          }}
        >
          {/* Header */}
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Typography
              variant="h6"
              sx={{
                py: 1,
                px: 2,
                color: textColor,
                textAlign: "center",
                fontWeight: "bold",
                fontSize: 30,
                backgroundColor: primaryColor,
                mt: 2,
                borderBottom: `3px solid ${secondaryColor}`,
              }}
            >
              INTERAÇÕES
            </Typography>

            <Icon
              fontSize="large"
              onClick={() => onClose()}
              sx={{
                color: "black",
                ml: "auto",
                fontSize: "50px !important",
                cursor: "pointer",
              }}
            >
              close
            </Icon>
          </Box>

          {/* Existing Interactions */}
          <Grid container spacing={2} sx={{ py: 4 }}>
            {interactions.length === 0 ? (
              <Typography
                variant="h7"
                sx={{
                  color: textColor,
                  fontSize: 20,
                  fontWeight: "bold",
                  textAlign: "center",
                }}
              >
                Nenhuma interação criada
              </Typography>
            ) : (
              interactions.map((interaction, index) => (
                <Grid item xs={6} key={index}>
                  <Box
                    sx={{
                      backgroundColor: textColor,
                      color: "black",
                      borderRadius: 2,
                      p: 2,
                      position: 'relative'
                    }}
                  >
                    <Typography fontWeight="bold">{interaction.label}</Typography>
                    <Typography variant="body2">ID: {interaction.type}</Typography>
                    {interaction.methodAr && <Typography variant="body2">AR: {interaction.methodAr}</Typography>}
                    {interaction.methodVr && <Typography variant="body2">VR: {interaction.methodVr}</Typography>}
                    <IconButton
                      size="small"
                      sx={{ position: 'absolute', top: 8, right: 8 }}
                      onClick={() => setEditingIndex(index)}
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      sx={{ position: 'absolute', top: 8, right: 40 }}
                      onClick={() => handleDeleteInteraction(index)}
                    >
                      <Icon fontSize="small">delete</Icon>
                    </IconButton>
                  </Box>
                </Grid>
              ))
            )}
          </Grid>

          {/* Add New Interaction */}
          <Box sx={{ mt: 4 }}>
            <Typography sx={{ mb: 1, fontWeight: "bold" }}>
              Nova interação:
            </Typography>
            <TextField
              label="Nome (label)"
              variant="filled"
              value={newInteraction.label}
              onChange={(e) => setNewInteraction({ ...newInteraction, label: e.target.value })}
              sx={{ mr: 2 }}
            />
            <TextField
              label="ID"
              variant="filled"
              value={newInteraction.type}
              onChange={(e) => setNewInteraction({ ...newInteraction, type: e.target.value })}
              sx={{ mr: 2 }}
            />
            <FormControl variant="filled" sx={{ mr: 2, minWidth: 120 }}>
              <InputLabel>AR Método</InputLabel>
              <Select
                value={newInteraction.methodAr}
                onChange={(e) => setNewInteraction({ ...newInteraction, methodAr: e.target.value })}
              >
                <MenuItem value="" sx={{ color: "black" }}><em>Nenhum</em></MenuItem>
                <MenuItem value="gps" sx={{ color: "black" }}>GPS</MenuItem>
                <MenuItem value="qr_code" sx={{ color: "black" }}>QR Code</MenuItem>
                <MenuItem value="image_tracking" sx={{ color: "black" }}>Image Tracking</MenuItem>
              </Select>
            </FormControl>
            <FormControl variant="filled" sx={{ mr: 2, minWidth: 120 }}>
              <InputLabel>VR Método</InputLabel>
              <Select
                value={newInteraction.methodVr}
                onChange={(e) => setNewInteraction({ ...newInteraction, methodVr: e.target.value })}
              >
                <MenuItem value="" sx={{ color: "black" }}><em>Nenhum</em></MenuItem>
                <MenuItem value="proximity" sx={{ color: "black" }}>Proximidade</MenuItem>
                <MenuItem value="primary" sx={{ color: "black" }}>Botão Primário</MenuItem>
                <MenuItem value="secondary" sx={{ color: "black" }}>Botão Secundário</MenuItem>
              </Select>
            </FormControl>
            <IconButton onClick={addInteraction}>
              <AddCircleOutline sx={{ fontSize: 40, color: primaryColor }} />
            </IconButton>
          </Box>
        </Box>
      </Dialog>

      {editingIndex > -1 && (
        <EditInteractionPopup
          open={true}
          onClose={() => setEditingIndex(-1)}
          interaction={interactions[editingIndex]}
          onSave={saveEdit}
        />
      )}
    </>
  );
}

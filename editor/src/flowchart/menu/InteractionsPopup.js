import { AddCircleOutline } from "@mui/icons-material";
import {
  Dialog,
  Grid,
  Icon,
  IconButton,
  Typography,
  TextField,
  Box,
} from "@mui/material";
import * as React from "react";
import { primaryColor, secondaryColor, textColor } from "../../themes";

export default function InteractionsPopup({ open, onClose, interactions, setInteractions }) {
  const [newInteraction, setNewInteraction] = React.useState({ type: "", label: "" });

  const addInteraction = () => {
    if (!newInteraction.type || !newInteraction.label) return;

    const updated = [...interactions, { ...newInteraction }];
    setInteractions(updated);
    localStorage.setItem("interactions", JSON.stringify(updated));
    setNewInteraction({ type: "", label: "" });
  };

  return (
    <Dialog
      id="interactions-popup"
      open={open}
      onClose={() => onClose(undefined)}
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
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
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
            onClick={() => onClose(undefined)}
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
                  }}
                >
                  <Typography fontWeight="bold">{interaction.label}</Typography>
                  <Typography variant="body2">ID: {interaction.type}</Typography>
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
            label="ID (type)"
            variant="filled"
            value={newInteraction.type}
            onChange={(e) => setNewInteraction({ ...newInteraction, type: e.target.value })}
            sx={{ mr: 2 }}
          />
          <IconButton onClick={addInteraction}>
            <AddCircleOutline sx={{ fontSize: 40, color: primaryColor }} />
          </IconButton>
        </Box>
      </Box>
    </Dialog>
  );
}

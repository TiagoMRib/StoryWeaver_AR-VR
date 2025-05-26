import React from "react";
import { Box, Button, Typography } from "@mui/material";
import { primaryColor, secondaryColor, textColor } from "../themes";

export default function ARWorldWindow({ onSelect }) {
  return (
    <Box sx={{ p: 4, bgcolor: textColor, height: "100%" }}>
      <Typography variant="h5" sx={{ mb: 2, color: secondaryColor }}>
        Mundo AR
      </Typography>

      <Box sx={{ display: "flex", gap: 4 }}>
        <Button
          variant="contained"
          sx={{ backgroundColor: primaryColor }}
          onClick={() => onSelect("map")}
        >
          Mapa GPS
        </Button>

        <Button
          variant="contained"
          sx={{ backgroundColor: primaryColor }}
          onClick={() => onSelect("tracking")}
        >
          Tracking (QR / Imagem)
        </Button>
      </Box>

      <Box sx={{ mt: 6 }}>
        <Typography variant="body2" sx={{ color: "gray" }}>
          Selecione uma opção acima para configurar a experiência em AR.
          <br />
          O suporte a QR Code e Imagem será adicionado aqui.
        </Typography>
      </Box>
    </Box>
  );
}

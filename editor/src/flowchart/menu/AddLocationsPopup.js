import { Dialog, Grid, Icon, Typography } from "@mui/material";
import { Box } from "@mui/system";
import * as React from "react";
import PropTypes from 'prop-types';
import { primaryColor, secondaryColor, textColor } from "../../themes";
import { possibleMarkers } from "../../models/MarkerTypes"; // 👈 Import marker definitions

export default function AddLocationsPopup({ open, onClose, locations }) {
  const getMarkerImage = (markerType) => {
    const marker = possibleMarkers.find((m) => m.type === markerType);
    return marker?.image || "ancora.svg";
  };

  return (
    <Dialog
      id="add-location-popup"
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
        }}
      >
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
            component="div"
            sx={{
              py: 1,
              px: 2,
              color: textColor,
              textAlign: "center",
              ml: "auto",
              fontWeight: "bold",
              fontSize: 30,
              backgroundColor: primaryColor,
              borderBottomWidth: 3,
              mt: 2,
              borderBottomStyle: "solid",
              borderBottomColor: secondaryColor,
            }}
          >
            ADICIONAR LOCALIZAÇÃO
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

        <Box sx={{ p: 3 }}>
          <Grid container spacing={2}>
            {locations.map((loc) => (
              <Grid
                key={loc.id}
                item
                xs={12}
                sm={6}
                md={4}
                alignContent="center"
                alignItems="center"
                textAlign="center"
                sx={{
                  cursor: "pointer",
                  "&:hover": {
                    filter:
                      "invert(98%) sepia(65%) saturate(383%) hue-rotate(341deg) brightness(107%) contrast(103%)",
                  },
                }}
                onClick={() => onClose(loc)}
              >
                <Box sx={{ mb: 1 }}>
                  <img
                    src={`./assets/${getMarkerImage(loc.markerType)}`}
                    alt={loc.name}
                    style={{ width: 50, height: 50 }}
                  />
                </Box>
                <Typography
                  variant="body1"
                  component="div"
                  sx={{
                    py: 1,
                    color: "black",
                    fontSize: 18,
                    fontWeight: 700,
                  }}
                >
                  {loc.name}
                </Typography>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Box>
    </Dialog>
  );
}

AddLocationsPopup.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  locations: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      name: PropTypes.string.isRequired,
      markerType: PropTypes.string, 
    })
  ).isRequired,
};

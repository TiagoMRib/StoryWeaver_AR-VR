import { AddCircleOutline } from "@mui/icons-material";
import { Dialog, Grid, Icon, IconButton, Typography } from "@mui/material";
import { Box } from "@mui/system";
import * as React from "react";
import { primaryColor, secondaryColor, textColor } from "../../themes";
import CreateLocationPopup from "./CreateLocationPopup"; // we will define this
import { ApiDataRepository } from "../../api/ApiDataRepository";

/**
 * LocationsPopup
 * 
 * Shows a list of user-defined locations, allows creating/editing/deleting them.
 * Works similarly to CharactersPopup.
 */
export default function LocationsPopup(props) {
  const repo = ApiDataRepository.getInstance();
  const open = props.open;
  const onClose = props.onClose;

  const [openCreateLocation, setOpenCreateLocation] = React.useState(false);
  const [selectedLocation, setSelectedLocation] = React.useState(undefined);

  const locations = props.locations;
  const setLocations = props.setLocations;

  /**
   * Handles the close of the create/edit location popup.
   * Accepts a location (new or updated) or the string "delete".
   */
  const onCloseCreateLocation = (location) => {
    setOpenCreateLocation(false);

    if (location) {
      let updatedLocations;

      if (location === "delete") {
        // Remove the selected location
        updatedLocations = locations.filter((l) => l.id !== selectedLocation.id);
      } else if (selectedLocation) {
        // Update the existing location
        updatedLocations = locations.map((l) =>
          l.id === selectedLocation.id ? location : l
        );
      } else {
        // Add a new location
        updatedLocations = locations.concat(location);
      }

      setLocations(updatedLocations);
    }
  };

  return (
    <Dialog
      id="locations-popup"
      open={open}
      onClose={() => onClose(undefined)}
      sx={{
        width: "100%",
        scrollbarWidth: "thin",
        scrollbarColor: `${primaryColor} ${secondaryColor}`,
      }}
    >
      {/* The inner popup for creating or editing a location */}
      <CreateLocationPopup
        open={openCreateLocation}
        onClose={onCloseCreateLocation}
        locations={locations}
        selectedLocation={selectedLocation}
      />

      <Box sx={{ display: "flex", flexDirection: "column", backgroundColor: secondaryColor, zIndex: 1, m: "0 auto" }}>
        {/* Header row */}
        <Box sx={{ display: "flex", flexDirection: "row", justifyContent: "center", alignItems: "center" }}>
          <Typography
            variant="h7"
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
            LOCAIS
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

        {/* Main content */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: secondaryColor,
            zIndex: 1,
            m: "0 auto",
            px: 15,
          }}
        >
          {locations.length === 0 ? (
            <Typography
              variant="h7"
              sx={{
                py: 1,
                px: 2,
                color: textColor,
                textAlign: "center",
                fontSize: 24,
                fontWeight: "bold",
                mt: 2,
              }}
            >
              Nenhum local criado
            </Typography>
          ) : null}

          <Grid container spacing={2} sx={{ py: 10 }}>
            {locations.map((location) => (
              <Grid
                key={location.id}
                item
                xs={4}
                textAlign="center"
                sx={{ cursor: "pointer" }}
                onClick={() => {
                  setSelectedLocation(location);
                  setOpenCreateLocation(true);
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Icon
                    sx={{
                      fontSize: 50,
                      color: primaryColor,
                    }}
                  >
                    location_on
                  </Icon>
                  <Typography
                    variant="h7"
                    sx={{
                      py: 1,
                      px: 2,
                      color: "black",
                      fontSize: 20,
                      fontWeight: 700,
                    }}
                  >
                    {location.name}
                  </Typography>
                </Box>
              </Grid>
            ))}

            {/* Add new location button */}
            <IconButton
              size="large"
              color="inherit"
              sx={{ fontSize: "30px !important", m: "0 auto" }}
              onClick={() => {
                setOpenCreateLocation(true);
                setSelectedLocation(undefined);
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <AddCircleOutline sx={{ fontSize: "50px !important", color: primaryColor }} />
              </Box>
            </IconButton>
          </Grid>
        </Box>
      </Box>
    </Dialog>
  );
}

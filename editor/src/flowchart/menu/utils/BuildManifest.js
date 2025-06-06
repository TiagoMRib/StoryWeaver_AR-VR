export function buildBaseManifest({ title, id, characters, locations, interactions }) {
  return {
    title,
    projectId: id,
    characters: characters.map(({ id, name, description, image }) => ({ id, name, description, image })),
    locations: locations.map(({ id, name, description }) => ({ id, name, description })),
    interactions: interactions.map(({ type, label }) => ({ type, label })),
  };
}

export function buildVRManifest({
  title,
  characters,
  locations,
  interactions,
  vrActorMapping,
  vrLocationMapping,
  vrInteractionMapping,
}) {

  console.log("[Interactions] interactions", interactions);
  return {
    title,
    characters: characters.map((char) => ({
      id: char.id,
      name: char.name,
      threeDObject: vrActorMapping?.[char.name] || null,
    })),
    locations: locations.map((loc) => ({
      id: loc.id,
      name: loc.name,
      threeDObject: vrLocationMapping?.[loc.name] || null,
    })),
    interactions: interactions.map(({ type, label, methodVr }) => ({
      type,
      label,
      methodVr,
    })),
  };
}

export function buildArLocationMappingFromMaps(maps) {
  const mapping = {};

  for (const map of maps) {
    for (const anchor of map.anchors) {
      if (anchor.locationId && anchor.coords) {
        mapping[anchor.locationId] = {
          type: "gps",
          lat: anchor.coords.lat,
          lng: anchor.coords.lng,
        };
      }
    }
  }

  return mapping;
}

export function buildARManifest({
  title,
  characters,
  locations,
  interactions,
  maps,
  arActorMapping = {},
  arInteractionMapping,
}) {
  const arLocationMapping = buildArLocationMappingFromMaps(maps);

  return {
    title,

    characters: characters.map((char) => {
      const ar = char.ar_type || {};
      let trigger_type = null;

      if (ar.trigger_mode === "QR-Code" && ar.qr_code) {
        trigger_type = { type: "qr", value: ar.qr_code };
      } else if (ar.trigger_mode === "Image Tracking" && ar.image?.filename) {
        trigger_type = { type: "image", value: ar.image.filename };
      }

      return {
        id: char.id,
        name: char.name,
        trigger_type,
      };
    }),

    locations: locations.map((loc) => {
      const ar = loc.ar_type || {};
      let trigger_type = null;

      if (ar.trigger_mode === "QR-Code" && ar.qr_code) {
        trigger_type = { type: "qr", value: ar.qr_code };
      } else if (ar.trigger_mode === "Image Tracking" && ar.image?.filename) {
        trigger_type = { type: "image", value: ar.image.filename };
      } else if (arLocationMapping[loc.id]) {
        trigger_type = {
          type: "gps",
          lat: arLocationMapping[loc.id].lat,
          lng: arLocationMapping[loc.id].lng,
        };
      }

      return {
        id: loc.id,
        name: loc.name,
        trigger_type,
      };
    }),

    interactions: interactions.map(({ type, label, methodAr }) => ({
      type,
      label,
      methodAr
    })),
  };
}
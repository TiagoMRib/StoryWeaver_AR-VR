export function buildBaseManifest({ title, characters, locations, interactions }) {
  return {
    title,
    characters: characters.map(({ id, name, description }) => ({ id, name, description })),
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
  return {
    title,
    characters: characters.map((char) => ({
      id: char.id,
      name: char.name,
      description: char.description,
      threeDObject: vrActorMapping?.[char.name] || null,
    })),
    locations: locations.map((loc) => ({
      id: loc.id,
      name: loc.name,
      description: loc.description,
      threeDObject: vrLocationMapping?.[loc.name] || null,
    })),
    interactions: interactions.map(({ type, label }) => ({
      type,
      label,
      vrMethod: vrInteractionMapping?.[type] || null,
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
  arActorMapping,
  arInteractionMapping,
}) {
  const arLocationMapping = buildArLocationMappingFromMaps(maps);

  return {
    title,
    characters: characters.map((char) => ({
      id: char.id,
      name: char.name,
      description: char.description,
      gpsOrQr: arActorMapping?.[char.name] || null,
    })),
    locations: locations.map((loc) => ({
      id: loc.id,
      name: loc.name,
      description: loc.description,
      gpsOrQr: arLocationMapping?.[loc.id] || null,
    })),
    interactions: interactions.map(({ type, label }) => ({
      type,
      label,
      arMethod: arInteractionMapping?.[type] || null,
    })),
  };
}
export function buildBaseManifest({ title, characters, locations, interactions }) {
  return {
    title,
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
      description: char.description,
      threeDObject: vrActorMapping?.[char.name] || null,
      image: char.image || null,
    })),
    locations: locations.map((loc) => ({
      id: loc.id,
      name: loc.name,
      description: loc.description,
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
      trigger_type: arActorMapping?.[char.name] || null,
    })),
    locations: locations.map((loc) => ({
      id: loc.id,
      name: loc.name,
      description: loc.description,
      trigger_type: arLocationMapping?.[loc.id] || null,
    })),
    interactions: interactions.map(({ type, label, methodAr }) => ({
      type,
      label,
      methodAr: methodAr
    })),
  };
}
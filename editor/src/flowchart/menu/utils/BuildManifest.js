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

export function buildARManifest({
  title,
  characters,
  locations,
  interactions,
  arActorMapping,
  arLocationMapping,
  arInteractionMapping,
}) {
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
      gpsOrQr: arLocationMapping?.[loc.name] || null,
    })),
    interactions: interactions.map(({ type, label }) => ({
      type,
      label,
      arMethod: arInteractionMapping?.[type] || null,
    })),
  };
}
export function buildChoreography({ nodes, edges, characters, locations, title, description }) {
  const idToNode = Object.fromEntries(nodes.map(n => [n.id, n]));

  const getGoToStep = (nodeId) => {
    const edge = edges.find(e => e.source === nodeId);
    return edge?.target || null;
  };

  const buildTrigger = (entryTrigger) => {
    if (entryTrigger?.type && entryTrigger?.name) {
      return {
        interaction: entryTrigger.type,
        target: entryTrigger.name,
      };
    }
    return null;
  };

  const story = [];

  for (const node of nodes) {
    console.log("[Choreography] Node", node);
    const { id, type, data } = node;

    if (type === "beginNode") {
      story.push({
        id,
        action: "begin",
        location: data.location || null,
        goToStep: getGoToStep(id),
      });
    }

    if (type === "textNode") {
      story.push({
        id,
        action: "text",
        actor: { id: data.character?.id, name: data.character?.name },
        trigger: buildTrigger(data.entry_trigger),
        data: { text: data.name },
        goToStep: getGoToStep(id),
      });
    }

    if (type === "choiceNode" || type === "quizNode") {
      const options = data.answers.map((label, index) => {
        const edge = edges.find(
          (e) => e.source === id && e.sourceHandle === index.toString()
        );
        return {
          label,
          goToStep: edge?.target || null,
        };
      });

      story.push({
        id,
        action: "choice",
        actor: { id: data.character?.id, name: data.character?.name },
        trigger: buildTrigger(data.entry_trigger),
        data: {
          text: data.question || data.name || "",
          options,
        },
      });
    }

    if (type === "endNode") {
      story.push({
        id,
        action: "end",
        data: {
          ending: data.id || "The End",
        },
      });
    }

    // Add other node types later
  }

  return {
    experienceName: title,
    metadata: {
      author: "Autor",
      description,
      base_manifest_url: "",
      platform_manifest_url: "",
    },
    story,
  };
}
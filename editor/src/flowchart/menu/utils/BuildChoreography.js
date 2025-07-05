export function buildChoreography({ nodes, edges, characters, locations, title, description }) {
  const idToNode = Object.fromEntries(nodes.map(n => [n.id, n]));

  // Get the target node ID from the edge list for a given node
  const getGoToStep = (nodeId) => {
    const edge = edges.find(e => e.source === nodeId);
    return edge?.target || null;
  };

  // Build a trigger if entry_trigger is defined
  const getTrigger = (entryTrigger) => {
    if (entryTrigger?.type && entryTrigger?.name) {
      return {
        interaction: entryTrigger.type,
        target: entryTrigger.name,
      };
    }
    return null;
  };

  // For dialogue-specific edges (inside nested dialogue graphs)
  const getDialogueGoToStep = (dialogEdges, source, handle = null) => {
    return dialogEdges.find(e =>
      e.source === source &&
      (handle === null || e.sourceHandle === handle.toString())
    )?.target;
  };

  const story = [];

  for (const node of nodes) {
    const { id, type, data } = node;

    // === Begin Node ===
    if (type === "beginNode") {
      story.push({
        id,
        action: "begin",
        location: data.location || null,
        goToStep: getGoToStep(id),
      });
    }

    // === Standard Text Node ===
    if (type === "textNode") {
      story.push({
        id,
        action: "text",
        actor: { id: data.character?.id, name: data.character?.name },
        trigger: getTrigger(data.entry_trigger),
        data: { text: data.name },
        goToStep: getGoToStep(id),
      });
    }

    // === Choice / Quiz Node ===
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
        trigger: getTrigger(data.entry_trigger),
        data: {
          text: data.question || data.name || "",
          options,
        },
      });
    }

    // === Character Node with Nested Dialogue ===
    if (type === "characterNode") {
      const dialogueNodes = data.dialog.nodes || [];
      const dialogueEdges = data.dialog.edges || [];

      const beginDialogueNode = dialogueNodes.find(n => n.type === "beginDialogNode");
      const firstDialogueNodeId = getDialogueGoToStep(dialogueEdges, beginDialogueNode?.id);

      // Track trigger to be passed down
      const inheritedTrigger = getTrigger(data.entry_trigger);

      if (beginDialogueNode) {
        story.push({
          id: id,
          action: "begin-dialogue",
          goToStep: firstDialogueNodeId,
        });
      }

      for (const dNode of dialogueNodes) {
        const { id: dId, type: dType, data: dData } = dNode;

        if (dType === "dialogNode") {
          story.push({
            id: dId,
            action: "text",
            actor: {
              id: dData.character?.id,
              name: dData.character?.name,
            },
            trigger: dId === firstDialogueNodeId ? inheritedTrigger : undefined,
            data: { text: dData.text },
            goToStep: getDialogueGoToStep(dialogueEdges, dId),
          });
        }

        if (dType === "dialogChoiceNode") {
          const options = dData.answers.map((label, index) => ({
            label,
            goToStep: getDialogueGoToStep(dialogueEdges, dId, index),
          }));

          story.push({
            id: dId,
            action: "choice",
            actor: {
              id: dData.character?.id,
              name: dData.character?.name,
            },
            trigger: dId === firstDialogueNodeId ? inheritedTrigger : undefined,
            data: {
              text: dData.prompt || dData.text || "",
              options,
            },
          });
        }

        if (dType === "endDialogNode") {
          story.push({
            id: dId,
            action: "end-dialogue",
            goToStep: getGoToStep(id),
          });
        }
      }
    }

    // === End Node ===
    if (type === "endNode") {
      story.push({
        id,
        action: "end",
        data: {
          ending: data.id || "The End",
        },
      });
    }
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

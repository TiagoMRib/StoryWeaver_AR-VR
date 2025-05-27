import React from "react";
import VRExperiencePlayer from "./Players/VRExperiencePlayer";
import ARExperiencePlayer from "./Players/ARExperiencePlayer";

export default function ExperienceView({
  playMode,
  glbUrl,
  projectInfo,
  currentNode,
  nextNodes,
  setCurrentNode,
  setNextNodes,
  setExperience,
  repo,
}) {
  console.log("[ExperienceView] Project Info:", projectInfo);

  if (playMode === "VR") {
    return (
      <VRExperiencePlayer
        glbUrl={glbUrl}
        projectInfo={projectInfo}
        locations={projectInfo?.locations}
        characters={projectInfo?.characters}
        story={projectInfo?.story}
        setNextNode={setNextNodes}
        repo={repo}
        setExperience={setExperience}
      />
    );
  }

  return (
    <ARExperiencePlayer
      projectData={projectInfo}
      currentNode={currentNode}
      nextNodes={nextNodes}
      setCurrentNode={setCurrentNode}
      setNextNodes={setNextNodes}
      repo={repo}
      setExperience={setExperience}
    />
  );
}

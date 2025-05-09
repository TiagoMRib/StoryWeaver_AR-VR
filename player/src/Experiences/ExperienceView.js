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
  if (playMode === "VR") {
    return (
      <VRExperiencePlayer
        glbUrl={glbUrl}
        projectData={projectInfo}
        locations={projectInfo?.locations}
        actors={projectInfo?.actors}
        storyNodes={projectInfo?.nodes}
        setNextNode={setNextNodes}
        repo={repo}
        setExperience={setExperience}
      />
    );
  }

  return (
    <ARExperiencePlayer
      projectInfo={projectInfo}
      currentNode={currentNode}
      nextNodes={nextNodes}
      setCurrentNode={setCurrentNode}
      setNextNodes={setNextNodes}
      repo={repo}
      setExperience={setExperience}
    />
  );
}

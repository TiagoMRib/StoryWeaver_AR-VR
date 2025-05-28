// NodesDisplay/util/VRCharacterPanel.jsx
import React, { useEffect } from "react";
import * as THREE from "three";

/**
 * Common VR Panel with optional character image, text and extra children (buttons, etc.)
 */
export default function VRCharacterPanel({
  id = "vr-panel",
  characterImg,
  characterName,
  panelText,
  panelHeight = 1.2,
  panelWidth = 3,
  wrapCount = 40,
  buttonElements = null,
}) {

    function getTextScale(text) {
        const length = text.length;
        const scale = length < 50 ? 0.9 : length < 100 ? 0.6 : length < 200 ? 0.4 : 0.2;
        console.log("[TextNodeDisplay] Calculated text scale:", scale);
        return `${scale} ${scale} ${scale}`;
    }

  useEffect(() => {
    setTimeout(() => {
      const scene = document.querySelector("a-scene");
      const camEl = scene?.querySelector("[camera]");
      const panelEl = scene?.querySelector(`#${id}`);

      if (!camEl || !panelEl) return;

      const camObj = camEl.object3D;
      const panelObj = panelEl.object3D;

      const charEl = characterName
        ? scene.querySelector(`[id="${characterName}"]`)
        : null;

      const distance = 2.5;
      const minY = 1.5;
      let targetPos = new THREE.Vector3();
      let lookAtPos = new THREE.Vector3();

      if (charEl?.object3D) {
        const charObj = charEl.object3D;
        charObj.getWorldPosition(targetPos);
        targetPos.y += 1.5;
        charObj.getWorldDirection(new THREE.Vector3()).multiplyScalar(1.5);
        lookAtPos.copy(charObj.position);
      } else {
        camObj.getWorldPosition(lookAtPos);
        const forward = new THREE.Vector3();
        camObj.getWorldDirection(forward);
        targetPos.copy(lookAtPos.clone().add(forward.multiplyScalar(-distance)));
      }

      targetPos.y = Math.max(targetPos.y, minY);
      panelObj.position.copy(targetPos);
      panelObj.lookAt(lookAtPos);
    }, 0);
  }, [characterName, id]);

  return (
    <a-entity id={id}>
      {characterImg && (
        <a-image
          src={characterImg}
          position="-1 0.6 0"
          width="0.8"
          height="0.8"
          material="shader: flat"
        ></a-image>
      )}

      <a-plane
        width={panelWidth}
        height={panelHeight}
        color="white"
        material="side: double"
        position="0 0.3 0"
      >
        <a-text
          value={panelText}
          wrap-count={wrapCount}
          scale={getTextScale(panelText)}
          color="black"
          align="center"
          position="0 0 0.01"
        ></a-text>
      </a-plane>

      {buttonElements}
    </a-entity>
  );
}

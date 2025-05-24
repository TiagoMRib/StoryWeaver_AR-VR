import { EndDialogProps } from "../flowchart/nodes/nodeProps";
import { NodeType } from "../models/NodeTypes";
import { generateInspectorProps } from "./utils";
import { BeginProps } from "../flowchart/nodes/nodeProps";

export const defaultNodes = [
  {
    id: "0",
    position: { x: 0, y: 0 },
    type: NodeType.beginNode,
    data: generateInspectorProps(BeginProps)
  },
  {
    id: "5",
    position: { x: 400, y: 100 },
    data: generateInspectorProps(EndDialogProps),
    type: NodeType.endNode,
  },
];

import { narrator } from "../../data/narrator";
import { DialogNodeType } from "../../models/DialogNodeTypes";
import { FileTypesInput } from "../../models/FileTypesInput";
import { InputFieldType } from "../../models/InputFieldTypes";
import { NodeType } from "../../models/NodeTypes";
import { ThreeDModelTypes } from "../../models/ThreeDModelTypes";

const BeginProps = {
  nodeType: "Início",
  type: NodeType.beginNode,
  fields: [
    {
      type: [InputFieldType.select_location],
      label: "Ponto Inicial:",
      initialValue: null,
      name: "location",
    },
  ]
};

const ThreeDModelProps = {
  nodeType: "Cena 3D",

  type: NodeType.threeDModelNode,
  fields: [
    {
      type: [InputFieldType.hidden],

      initialValue: false,
      name: "isSelectedForCopy",
    },
    {
      type: [InputFieldType.hidden],
      label: "",
      initialValue: "Cena ",
      name: "sceneName",
    },
    {
      type: [InputFieldType.multiple_choice],
      label: "Personagem:",
      initialValue: narrator,
      name: "character",
    },
    {
      type: [InputFieldType.textFieldMultiline],
      label: "Texto:",
      icon: "description",
      initialValue: "Modelo 3D",
      name: "name",
    },
    {
      type: [InputFieldType.file_select, InputFieldType.color_picker],
      label: "Fundo:",
      icon: "landscape",
      conditional: "ar",
      initialValue: {
        inputType: "url",
        filename: "",
        blob: null,
        color: "#A9B388",
      },
      name: "background",
      acceptedType: FileTypesInput.Image,
    },
    {
      type: [InputFieldType.file_select],
      label: "Ficheiro:",
      icon: "view_in_ar",
      initialValue: {
        inputType: "url",
        filename: "",
        blob: null,
        modelType: ThreeDModelTypes.gltf,
      },
      name: "file",
      acceptedType: FileTypesInput.ThreeDModel,
    },

    {
      type: [InputFieldType.threeDCoord],
      label: "Posição:",
      initialValue: { x: 150, y: 300, z: -100 },
      name: "position",
    },
    {
      type: [InputFieldType.threeDCoord],
      label: "Escala:",
      initialValue: { x: 1, y: 1, z: 1 },
      name: "scale",
    },
    {
      type: [InputFieldType.threeDCoord],
      label: "Rotação:",
      initialValue: { x: 0, y: 0, z: 0 },
      name: "rotation",
    },
    {
      type: [InputFieldType.checkbox], //////////////////////// ACIONADO POR SITIO
      label: "Acionado por gatilho", 
      initialValue: false, // Default is unchecked
      name: "isTriggered",
    },
    {
      type: [InputFieldType.select_trigger_target],
      conditional: "isTriggered",
      label: "Gatilho de entrada",
      name: "entry_trigger",
    },       
    {
      type: [InputFieldType.checkbox],
      label: "Auto-play animações",
      initialValue: false,
      name: "autoplay",
    },
    
  ],
};

const QuizProps = {
  nodeType: "Cena Quiz",
  type: NodeType.quizNode,
  fields: [
    {
      type: [InputFieldType.hidden],
      initialValue: false,
      name: "isSelectedForCopy",
    },
    {
      type: [InputFieldType.hidden],
      label: "",
      initialValue: "Cena ",
      name: "sceneName",
    },
    {
      type: [InputFieldType.multiple_choice],
      label: "Personagem:",
      initialValue: narrator,
      name: "character",
    },
    {
      type: [InputFieldType.textFieldMultiline],
      label: "Pergunta:",
      icon: "description",
      initialValue: "Pergunta",
      name: "question",
    },
    {
      type: [InputFieldType.file_select, InputFieldType.color_picker],
      label: "Fundo:",
      icon: "landscape",
      initialValue: {
        inputType: "url",
        filename: "",
        blob: null,
        color: "#A9B388",
      },
      name: "background",
      acceptedType: FileTypesInput.Image,
    },
    {
      type: [InputFieldType.textFieldExpandable],
      label: "Respostas:",
      initialValue: ["Resposta 1", "Resposta 2", "Resposta 3", "Resposta 4"],
      name: "answers",
    },
    {
      type: [InputFieldType.checkbox], //////////////////////// ACIONADO POR SITIO
      label: "Acionado por gatilho", 
      initialValue: false, // Default is unchecked
      name: "isTriggered",
    },
    {
      type: [InputFieldType.select_trigger_target],
      conditional: "isTriggered",
      label: "Gatilho de entrada",
      name: "entry_trigger",
    },
  ],
};

const VideoProps = {
  nodeType: "Cena Vídeo",
  type: NodeType.videoNode,
  fields: [
    {
      type: [InputFieldType.hidden],
      initialValue: false,
      name: "isSelectedForCopy",
    },
    {
      type: [InputFieldType.hidden],
      label: "",
      initialValue: "Cena ",
      name: "sceneName",
    },
    {
      type: [InputFieldType.multiple_choice],
      label: "Personagem:",
      initialValue: narrator,
      name: "character",
    },
    {
      type: [InputFieldType.textFieldMultiline],
      label: "Texto:",
      icon: "description",
      initialValue: "Nome do video",
      name: "name",
    },
    {
      type: [InputFieldType.file_select, InputFieldType.color_picker],
      label: "Fundo:",
      icon: "landscape",
      conditional: "ar",
      initialValue: {
        inputType: "url",
        filename: "",
        blob: null,
        color: "#A9B388",
      },
      name: "background",
      acceptedType: FileTypesInput.Image,
    },
    {
      type: [InputFieldType.file_select],
      label: "Ficheiro:",
      icon: "videocam",
      initialValue: { inputType: "url", filename: "", blob: null },
      name: "file",
      acceptedType: FileTypesInput.Video,
    },
    {
      type: [InputFieldType.checkbox], //////////////////////// ACIONADO POR SITIO
      label: "Acionado por gatilho", 
      initialValue: false, // Default is unchecked
      name: "isTriggered",
    },
    {
      type: [InputFieldType.select_trigger_target],
      conditional: "isTriggered",
      label: "Gatilho de entrada",
      name: "entry_trigger",
    },
  ],
};

const ImageProps = {
  nodeType: "Cena Imagem",
  type: NodeType.imageNode,
  fields: [
    {
      type: [InputFieldType.hidden],
      initialValue: false,
      name: "isSelectedForCopy",
    },
    {
      type: [InputFieldType.hidden],
      label: "",
      initialValue: "Cena ",
      name: "sceneName",
    },
    {
      type: [InputFieldType.multiple_choice],
      label: "Personagem:",
      initialValue: narrator,
      name: "character",
    },
    {
      type: [InputFieldType.textFieldMultiline],
      label: "Texto:",
      icon: "description",
      initialValue: "Imagem",
      name: "name",
    },
    {
      type: [InputFieldType.file_select, InputFieldType.color_picker],
      label: "Fundo:",
      icon: "landscape",
      conditional: "ar",
      initialValue: {
        inputType: "url",
        filename: "",
        blob: null,
        color: "#A9B388",
      },
      name: "background",
      acceptedType: FileTypesInput.Image,
    },
    {
      type: [InputFieldType.file_select],
      label: "Ficheiro:",
      icon: "add_photo_alternate",
      initialValue: { inputType: "file", filename: "", blob: null },
      name: "file",
      acceptedType: FileTypesInput.Image,
    },
    {
      type: [InputFieldType.checkbox], //////////////////////// ACIONADO POR SITIO
      label: "Acionado por gatilho", 
      initialValue: false, // Default is unchecked
      name: "isTriggered",
    },
    {
      type: [InputFieldType.select_trigger_target],
      conditional: "isTriggered",
      label: "Gatilho de entrada",
      name: "entry_trigger",
    },
    {
      type: [InputFieldType.checkbox],
      label: "Permitir AR? ",
      initialValue: false,
      name: "ar",
    },
    {
      type: [InputFieldType.ar_preview],
      label: "Pré-visualização AR",
      name: "ar_preview",
      conditional: "ar",
    },
    {
      type: [InputFieldType.threeDCoord],
      label: "Posição:",
      conditional: "ar",
      initialValue: { x: 0, y: 0, z: 0 },
      name: "position",
    },
    {
      type: [InputFieldType.threeDCoord],
      label: "Escala:",
      conditional: "ar",
      initialValue: { x: 1, y: 1, z: 1 },
      name: "scale",
    },
    {
      type: [InputFieldType.threeDCoord],
      label: "Rotação:",
      initialValue: { x: 0, y: 0, z: 0 },
      name: "rotation",
      conditional: "ar",
    }
  ],
};

const AudioProps = {
  nodeType: "Cena Áudio",
  type: NodeType.audioNode,
  fields: [
    {
      type: [InputFieldType.hidden],
      initialValue: false,
      name: "isSelectedForCopy",
    },
    {
      type: [InputFieldType.hidden],
      label: "",
      initialValue: "Cena ",
      name: "sceneName",
    },
    {
      type: [InputFieldType.multiple_choice],
      label: "Personagem:",
      initialValue: narrator,
      name: "character",
    },
    {
      type: [InputFieldType.textFieldMultiline],
      label: "Texto:",
      icon: "description",
      initialValue: "Texto exemplo",
      name: "name",
    },
    {
      type: [InputFieldType.file_select, InputFieldType.color_picker],
      label: "Fundo:",
      icon: "landscape",
      initialValue: {
        inputType: "url",
        filename: "",
        blob: null,
        color: "#A9B388",
      },
      name: "background",
      acceptedType: FileTypesInput.Image,
    },
    {
      type: [InputFieldType.color_picker],
      label: "Cor do audio:",
      initialValue: { color: "#A9B388", inputType: "color" },
      name: "color",
    },

    {
      type: [InputFieldType.file_select],
      label: "Ficheiro:",
      icon: "volume_up",
      initialValue: { inputType: "url", filename: "", blob: null },
      name: "file",
      acceptedType: FileTypesInput.Audio,
    },
    {
      type: [InputFieldType.checkbox], //////////////////////// ACIONADO POR SITIO
      label: "Acionado por gatilho", 
      initialValue: false, // Default is unchecked
      name: "isTriggered",
    },
    {
      type: [InputFieldType.select_trigger_target],
      conditional: "isTriggered",
      label: "Gatilho de entrada",
      name: "entry_trigger",
    },
  ],
};

const TextProps = {
  nodeType: "Cena Texto",
  type: NodeType.textNode,
  fields: [
    {
      type: [InputFieldType.hidden],
      initialValue: false,
      name: "isSelectedForCopy",
    },
    {
      type: [InputFieldType.hidden],
      label: "",
      initialValue: "Cena ",
      name: "sceneName",
    },
    {
      type: [InputFieldType.multiple_choice],
      label: "Personagem:",
      initialValue: narrator,
      name: "character",
    },
    {
      type: [InputFieldType.textFieldMultiline],
      label: "Texto:",
      initialValue: "Texto exemplo",
      icon: "description",
      name: "name",
    },
    {
      type: [InputFieldType.checkbox], //////////////////////// ACIONADO POR SITIO
      label: "Acionado por gatilho", 
      initialValue: false, // Default is unchecked
      name: "isTriggered",
    },
    {
      type: [InputFieldType.select_trigger_target],
      conditional: "isTriggered",
      label: "Gatilho de entrada",
      name: "entry_trigger",
    }
  ],
};

const PathProps = {
  nodeType: "Caminho",
  type: NodeType.pathNode,
  fields: [
    {
      type: [InputFieldType.hidden],
      initialValue: false,
      name: "isSelectedForCopy",
    },
    {
      type: [InputFieldType.hidden],
      label: "",
      initialValue: "Cena ",
      name: "sceneName",
    },
    {
      type: [InputFieldType.multiple_choice],
      label: "Personagem:",
      initialValue: narrator,
      name: "character",
    },
    {
      type: [InputFieldType.textFieldMultiline],
      label: "Texto:",
      initialValue: "Texto do caminho",
      icon: "description",
      name: "name",
    },
    {
      type: [InputFieldType.file_select, InputFieldType.color_picker],
      label: "Fundo:",
      icon: "landscape",
      initialValue: {
        inputType: "url",
        filename: "",
        blob: null,
        color: "#A9B388",
      },
      name: "background",
      acceptedType: FileTypesInput.Image,
    },
    {
      type: [InputFieldType.checkbox], //////////////////////// ACIONADO POR SITIO
      label: "Acionado por gatilho", 
      initialValue: false, // Default is unchecked
      name: "isTriggered",
    },
    {
      type: [InputFieldType.select_trigger_target],
      conditional: "isTriggered",
      label: "Gatilho de entrada",
      name: "entry_trigger",
    },
  ],
};

////////////////// DIALOG STUFF 

const DialogProps = {
  nodeType: "Diálogo",
  type: DialogNodeType.dialogNode,
  fields: [
    {
      type: [InputFieldType.hidden],
      initialValue: false,
      name: "isSelectedForCopy",
    },
    {
      type: [InputFieldType.multiple_choice],
      label: "Personagem:",
      initialValue: narrator,
      name: "character",
    },
    {
      type: [InputFieldType.textFieldMultiline],
      label: "Texto:",
      initialValue: "Texto",
      name: "text",
    },
    {
      type: [InputFieldType.file_select],
      label: "Áudio:",
      initialValue: { inputType: "url", filename: "", blob: null },
      name: "audio",
      acceptedType: FileTypesInput.Audio,
    },
  ],
};

const DialogChoiceProps = {
  nodeType: "Pergunta",
  type: DialogNodeType.dialogChoiceNode,
  fields: [
    {
      type: [InputFieldType.hidden],
      initialValue: false,
      name: "isSelectedForCopy",
    },
    {
      type: [InputFieldType.multiple_choice],
      label: "Personagem:",
      initialValue: narrator,
      name: "character",
    },
    {
      type: [InputFieldType.textFieldMultiline],
      label: "Pergunta:",
      initialValue: "Texto",
      name: "prompt",
    },
    {
      type: [InputFieldType.textFieldExpandable],
      label: "Opções:",
      initialValue: ["Resposta 1", "Resposta 2", "Resposta 3", "Resposta 4"],
      name: "answers",
    },
    {
      type: [InputFieldType.file_select],
      label: "Áudio:",
      initialValue: { inputType: "url", filename: "", blob: null },
      name: "audio",
      acceptedType: FileTypesInput.Audio,
    },
  ],
};

const EndDialogProps = {
  nodeType: "Fim",
  type: DialogNodeType.endDialogNode,
  fields: [
    {
      type: [InputFieldType.hidden],
      initialValue: false,
      name: "isSelectedForCopy",
    },
    {
      type: [InputFieldType.textField],
      label: "Identificador:",
      initialValue: "Normal",
      name: "id",
    },
  ],
};

const defaultDialogNodes = [
  {
    id: "1",
    position: { x: 0, y: 0 },
    data: narrator,
    type: DialogNodeType.beginDialogNode,
  },
  {
    id: "2",
    position: { x: 100, y: 100 },
    data: {
      id: "1",
    },
    type: DialogNodeType.endDialogNode,
  },
];

const defaultDialogEdges = [];

// Node de dialogo da janela principal, abre tab de dialogo
const CharacterProps = {   
  nodeType: "Cena Diálogo",
  type: NodeType.characterNode,
  fields: [
    {
      type: [InputFieldType.hidden],
      initialValue: false,
      name: "isSelectedForCopy",
    },
    {
      type: [InputFieldType.hidden],
      label: "",
      initialValue: "Cena ",
      name: "sceneName",
    },
    {
      type: [InputFieldType.textFieldMultiline],
      label: "Nome:",
      icon: "description",
      initialValue: "Nome do Diálogo",
      name: "name",
    },
    {
      type: [InputFieldType.file_select, InputFieldType.color_picker],
      label: "Fundo:",
      icon: "landscape",
      initialValue: {
        inputType: "url",
        filename: "",
        blob: null,
        color: "#A9B388",
      },
      name: "background",
      acceptedType: FileTypesInput.Image,
    },
    {
      type: [InputFieldType.open_window],
      label: "Abrir Janela de Diálogo",
      initialValue: {
        nodes: defaultDialogNodes,
        edges: defaultDialogEdges,
      },
      name: "dialog",
    },
    {
      type: [InputFieldType.checkbox], //////////////////////// ACIONADO POR SITIO
      label: "Acionado por gatilho", 
      initialValue: false, // Default is unchecked
      name: "isTriggered",
    },
    {
      type: [InputFieldType.select_trigger_target],
      conditional: "isTriggered",
      label: "Gatilho de entrada",
      name: "entry_trigger",
    },
    
  ],
};

export {
  BeginProps,
  ThreeDModelProps,
  QuizProps,
  VideoProps,
  ImageProps,
  AudioProps,
  TextProps,
  PathProps,
  CharacterProps,
  DialogProps,
  DialogChoiceProps,
  EndDialogProps,
};

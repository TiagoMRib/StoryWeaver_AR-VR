import { DeleteOutline, FileDownload } from "@mui/icons-material";
import { Icon, IconButton, Input, Typography } from "@mui/material";
import { Box } from "@mui/system";
import { useState } from "react";
import { InputFieldType } from "../models/InputFieldTypes";
import {
  myTheme,
  primaryColor,
  secondaryColor,
  tertiaryColor,
  textColor,
} from "../themes";
import CheckboxField from "./inspector/Checkbox";
import FileSelectField from "./inspector/FileSelect";
import CharacterChoiceField from "./inspector/CharacterChoice";
import MultipleChoiceCheckboxField from "./inspector/MultipleChoiceCheck";
import OpenWindowField from "./inspector/OpenWindow";
import SelectARField from "./inspector/SelectAR";
import SelectVRField from "./inspector/SelectVR";
import SelectLocationField from "./inspector/SelectLocation";
import SelectTriggerTargetField from "./inspector/SelectTriggerTarget";
import TextFieldInspector from "./inspector/TextField";
import TextFieldExpandable from "./inspector/TextFieldExpandable";
import TextFieldMultiline from "./inspector/TextFieldMultiline";
import ThreeDCoordField from "./inspector/ThreeDCoordField";
import ColorPicker from "./inspector/ColorPicker";
import useMediaQuery from "@mui/material/useMediaQuery";
import ARPreviewField from "./inspector/ARPreview";
import { NodeType } from "../models/NodeTypes";
import { AREntityTypes } from "../models/AREntityTypes";

function Inspector(props) {
  const values = props.value;
  const setInspectorData = props.setData;
  const nodeId = props.nodeId;
  const characters = props.characters;
  const locations = props.locations;
  const interactions = props.interactions;
  const setValues = props.setValue;
  const handleNodeDataChange = props.handleNodeDataChange;
  const handleDelete = props.handleDelete;

  const handleFieldChange = (fieldId, value) => {
    setValues({ ...values, [fieldId]: value });
    handleNodeDataChange(
      nodeId,
      { ...values, [fieldId]: value },
      fieldId === "open" && value === "open"
    );
  };
  const matchDownMd = useMediaQuery(myTheme.breakpoints.down(700));

  return props.data !== undefined ? (
    <Box
      sx={{
        minWidth: matchDownMd ? "100vw" : "33vw",
        backgroundColor: secondaryColor,
        overflowY: "scroll",
        scrollbarWidth: "thin",
        scrollbarColor: `${primaryColor} ${secondaryColor}`,
        resize: "horizontal",
        overflowX: "hidden",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography
          variant="h7"
          component="div"
          sx={{
            color: textColor,
            flexGrow: 1,
            py: 1,
            px: 2,
            color: "white",
            m: 0,
            borderWidth: 1,
            borderColor: tertiaryColor,
            borderStyle: "solid",
            backgroundColor: primaryColor,
          }}
        >
          Inspector
        </Typography>

        <Typography
          variant="h7"
          component="div"
          sx={{ flexGrow: 1, py: 1, px: 2, color: "white", m: 0 }}
        >
          {values ? props.value.sceneName : props.data.nodeType}
        </Typography>
        <IconButton
          onClick={() => setInspectorData(undefined)}
          sx={{ color: primaryColor }}
        >
          <Icon
            sx={{
              fontSize: "35px !important",
            }}
          >
            close
          </Icon>
        </IconButton>
      </Box>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {props.data.fields.map((field, index) => {
          return field.type.map((type, index) => {
            switch (type) {
              case InputFieldType.textField:
                return (
                  <TextFieldInspector
                    key={index}
                    id={index}
                    onChange={handleFieldChange}
                    value={values[field.name]}
                    data={field}
                    style={{ mt: 2 }}
                  ></TextFieldInspector>
                );
              case InputFieldType.threeDCoord:
                return (
                  <ThreeDCoordField
                    key={index}
                    conditional={values[field.conditional]}
                    id={index}
                    onChange={handleFieldChange}
                    value={values[field.name]}
                    data={field}
                    style={{ mt: 2 }}
                  ></ThreeDCoordField>
                );
              case InputFieldType.select_location:
                  return (
                    <SelectLocationField
                      key={index}
                      id={index}
                      locations={locations}
                      onChange={handleFieldChange}
                      value={values[field.name]}
                      data={field}
                      style={{ mt: 2 }}
                    ></SelectLocationField>
                  );
              case InputFieldType.select_trigger_target:
                return (
                  <SelectTriggerTargetField
                    conditional={values[field.conditional]}
                    key={index}
                    id={index}
                    characters={characters}
                    locations={locations}
                    interactions={interactions}
                    onChange={handleFieldChange}
                    value={values[field.name]}
                    data={field}
                    style={{ mt: 2 }}
                  />
                );
              case InputFieldType.select_ar_type:
                return (
                  <SelectARField
                    conditional={values[field.conditional]}
                    key={index}
                    id={index}
                    onChange={handleFieldChange}
                    value={values[field.name]}
                    data={field}
                    style={{ mt: 2 }}
                  ></SelectARField>
                );
              case InputFieldType.select_vr_type:
                return (
                  <SelectVRField
                    conditional={values[field.conditional]}
                    key={index}
                    id={index}
                    onChange={handleFieldChange}
                    value={values[field.name]}
                    characters={characters}
                    locations={locations}
                    data={field}
                    style={{ mt: 2 }}
                  />

                );
              case InputFieldType.checkbox:
                return (
                  <CheckboxField
                    key={index}
                    id={index}
                    onChange={handleFieldChange}
                    value={values[field.name]}
                    data={field}
                    style={{ mt: 2 }}
                  ></CheckboxField>
                );
              case InputFieldType.multichoice_check:
                return (
                  <MultipleChoiceCheckboxField
                    key={index}
                    id={index}
                    onChange={handleFieldChange}
                    value={values[field.name]}
                    data={field}
                    style={{ mt: 2 }}
                  ></MultipleChoiceCheckboxField>
                );
              case InputFieldType.textFieldExpandable:
                return (
                  <TextFieldExpandable
                    key={index}
                    id={index}
                    onChange={handleFieldChange}
                    value={values[field.name]}
                    data={field}
                    style={{ mt: 2 }}
                  ></TextFieldExpandable>
                );
              case InputFieldType.file_select:
                return (
                  <FileSelectField
                    key={index}
                    id={index}
                    conditional={!values[field.conditional]}
                    onChange={handleFieldChange}
                    value={values[field.name]}
                    data={field}
                    style={{ mt: 2 }}
                  ></FileSelectField>
                );
              case InputFieldType.textFieldMultiline:
                return (
                  <TextFieldMultiline
                    key={index}
                    id={index}
                    onChange={handleFieldChange}
                    value={values[field.name]}
                    data={field}
                    style={{ mt: 2 }}
                  ></TextFieldMultiline>
                );
              case InputFieldType.open_window:
                return (
                  <OpenWindowField
                    key={index}
                    id={index}
                    onChange={handleFieldChange}
                    value={values[field.name]}
                    data={field}
                    style={{ mt: 2 }}
                  ></OpenWindowField>
                );
              case InputFieldType.multiple_choice:
                return (
                  <CharacterChoiceField
                    characters={characters}
                    key={index}
                    id={index}
                    onChange={handleFieldChange}
                    value={values[field.name]}
                    data={field}
                    style={{ mt: 2 }}
                  ></CharacterChoiceField>
                );
              case InputFieldType.color_picker:
                return (
                  <ColorPicker
                    key={index}
                    id={index}
                    conditional={!values[field.conditional]}
                    onChange={handleFieldChange}
                    value={values[field.name]}
                    data={field}
                    style={{ mt: 2 }}
                  ></ColorPicker>
                );
              case InputFieldType.ar_preview:
                return null; //ar preview disabled for a while
              /*return (
                  <ARPreviewField
                    key={index}
                    id={index}
                    conditional={values[field.conditional]}
                    onChange={handleFieldChange}
                    title={values.name}
                    fileInfo={values.file}
                    ARTypeInfo={values.ar_type}
                    position={values.position}
                    scale={values.scale}
                    rotation={values.rotation}
                    AREntityType={
                      props.data.type == NodeType.threeDModelNode
                        ? AREntityTypes.ThreeDModel
                        : props.data.type == NodeType.imageNode
                        ? AREntityTypes.Image
                        : props.data.type == NodeType.videoNode
                        ? AREntityTypes.Video
                        : AREntityTypes.Text
                    }
                    character={values.character}
                    autoplay={values.autoplay}
                    color={values.color}
                    data={field}
                    style={{ mt: 2 }}
                  ></ARPreviewField>
                );*/
            }
          });
        })}
        <Box
          onClick={() => handleDelete(nodeId)}
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            mt: 2,
            cursor: "pointer",
          }}
        >
          <Icon
            fontSize="inherit"
            sx={{ color: "black", mt: 2, fontSize: "50px !important", mb: 4 }}
          >
            delete
          </Icon>
        </Box>
      </Box>
    </Box>
  ) : null;
}

export default Inspector;

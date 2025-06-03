import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Typography,
  Select,
  MenuItem,
  TextField,
  Button,
  Icon,
} from "@mui/material";
import QRCode from "react-qr-code";
import * as htmlToImage from "html-to-image";
import FileSelectField from "../flowchart/inspector/FileSelect";
import { ApiDataRepository } from "../api/ApiDataRepository";

export default function ARMarkerManager({ characters, locations, onSave }) {
  const repo = ApiDataRepository.getInstance();
  const qrRef = useRef(null);

  // === State ===
  const [targetType, setTargetType] = useState("location"); // location or character
  const [selectedId, setSelectedId] = useState(""); // selected entity ID
  const [triggerType, setTriggerType] = useState("QR-Code"); // "QR-Code" or "Image Tracking"
  const [qrValue, setQrValue] = useState(""); // value for QR code
  const [imageValue, setImageValue] = useState(null); // file for image tracking
  const [markerStatus, setMarkerStatus] = useState("Not Started"); // Status of generation

  // === Entity being edited ===
  const selectedList = targetType === "location" ? locations : characters;
  const selectedItem = selectedList.find((e) => e.id === selectedId);

  // === Auto-fill form when selecting entity ===
  useEffect(() => {
    if (!selectedItem) return;

    const arType = selectedItem.ar_type || {};
    setQrValue(arType.qr_code || selectedItem.name || "");
    setImageValue(arType.image || null);
    setTriggerType(arType.trigger_mode || "QR-Code");

    const marker = arType.marker_generation || {};
    const status = triggerType === "QR-Code" ? marker.qr_code : marker.image;

    console.log(`[useEffect] Loaded marker status:`, status);

    if (status === "Complete" || status === "Started") {
      setMarkerStatus(status);
    } else {
      // If file is found in backend, override to 'Complete'
      const checkFile = `${arType.qr_code}.fset`; // backend marker filename
      fetch(`/files/${localStorage.getItem("storyId")}/${checkFile}`)
        .then(res => {
          if (res.ok) {
            setMarkerStatus("Complete");
          } else {
            setMarkerStatus("Not Started");
          }
        })
        .catch(() => setMarkerStatus("Not Started"));
    }
  }, [selectedItem]);

  // === QR Code Generation ===
  const handleGenerateQR = () => {
    if (!qrValue) return;

    htmlToImage.toBlob(qrRef.current, { skipFonts: true })
      .then((blob) => {
        if (!blob) {
          console.error("Failed to generate QR code image");
          return;
        }

        const file = new File([blob], `${qrValue}.png`, { type: "image/png" });

        repo.uploadFile(file)
          .then(() => {
            console.log("QR image uploaded. Waiting briefly before requesting marker generation...");

            setMarkerStatus("Started");

            setTimeout(() => {
              repo.requestGenerateMarkerFiles(file.name)
                .then(() => {
                  console.log("Marker generation completed.");
                  setMarkerStatus("Complete");
                })
                .catch((err) => {
                  console.error("Marker generation failed:", err);
                  // Only mark error if no other success has been recorded
                  if (markerStatus !== "Complete") {
                    setMarkerStatus("Error");
                  }
                });
            }, 500);
          })
          .catch((err) => {
            console.error("File upload failed:", err);
            setMarkerStatus("Error");
          });
      })
      .catch((error) => {
        console.error("QR code generation failed:", error);
      });
  };

  // === Image Tracking Upload ===
  const handleImageUpload = (name, fileObj, status) => {
    setImageValue(fileObj);
    setMarkerStatus(status);
  };

  // === Save AR configuration into the entity ===
  const handleSave = () => {
    const updated = {
      ...selectedItem,
      ar_type: {
        trigger_mode: triggerType,
        qr_code: qrValue,
        image: imageValue,
        marker_generation: {
          [triggerType === "QR-Code" ? "qr_code" : "image"]: markerStatus,
        },
      },
    };

    console.log("[handleSave] Saving entity with AR config:", updated);

    onSave(targetType, updated);
  };

  return (
    <Box sx={{ p: 3, maxHeight: "80vh", overflowY: "auto" }}>
      <Typography variant="h6">Configurar Marcadores AR</Typography>

      {/* === Entity Type: character or location === */}
      <Box sx={{ mt: 2 }}>
        <Typography>Tipo de entidade:</Typography>
        <Select fullWidth sx={{ color: "black" }} value={targetType} onChange={(e) => {
          setTargetType(e.target.value);
          setSelectedId("");
        }}>
          <MenuItem sx={{ color: "black" }} value="location">Localização</MenuItem>
          <MenuItem sx={{ color: "black" }} value="character">Personagem</MenuItem>
        </Select>
      </Box>

      {/* === Entity Selection Dropdown === */}
      <Box sx={{ mt: 2 }}>
        <Typography>Selecionar:</Typography>
        <Select fullWidth sx={{ color: "black" }} value={selectedId} onChange={(e) => setSelectedId(e.target.value)}>
          {selectedList.map((e) => {
            const marker = e.ar_type?.marker_generation || {};
            const statusQr = marker.qr_code;
            const statusImg = marker.image;

            console.log(`[Marker Icon] ${e.name}: QR=${statusQr}, IMG=${statusImg}`);

            let icon = "❌";
            if (statusQr === "Complete" || statusImg === "Complete") {
              icon = "✅";
            } else if (statusQr === "Started" || statusImg === "Started") {
              icon = "⏳";
            }
            return (
              <MenuItem key={e.id} sx={{ color: "black" }} value={e.id}>
                {icon} {e.name}
              </MenuItem>
            );
          })}
        </Select>
      </Box>

      {/* === Detection Method === */}
      <Box sx={{ mt: 2 }}>
        <Typography>Método de detecção:</Typography>
        <Select fullWidth sx={{ color: "black" }} value={triggerType} onChange={(e) => {
          setTriggerType(e.target.value);
          setMarkerStatus("Not Started");
        }}>
          <MenuItem sx={{ color: "black" }} value="QR-Code">QR Code</MenuItem>
          <MenuItem sx={{ color: "black" }} value="Image Tracking">Image Tracking</MenuItem>
        </Select>
      </Box>

      {/* === QR Code Field === */}
      {triggerType === "QR-Code" && (
        <Box sx={{ mt: 2 }}>
          <TextField
            InputProps={{
              style: { color: "black" },
            }}
            label="Texto do QR Code"
            fullWidth
            value={qrValue}
            onChange={(e) => {
              setQrValue(e.target.value);
              setMarkerStatus("Not Started");
            }}
          />
          {qrValue && (
            <Box sx={{ mt: 2, textAlign: "center" }}>
              <QRCode value={qrValue} ref={qrRef} />
              <Button variant="outlined" onClick={handleGenerateQR} sx={{ mt: 1 }}>
                Gerar e Enviar
              </Button>
            </Box>
          )}
        </Box>
      )}

      {/* === Image Tracking Field === */}
      {triggerType === "Image Tracking" && (
        <Box sx={{ mt: 2 }}>
          <FileSelectField
            data={{ name: "image", label: "Imagem para Tracking" }}
            value={imageValue}
            onChange={handleImageUpload}
            generateMarkerFiles={true}
          />
        </Box>
      )}

      {/* === Status Message === */}
      {markerStatus && (
        <Typography sx={{ mt: 2, display: "flex", alignItems: "center" }}>
          <Icon sx={{ mr: 1 }}>
            {markerStatus === "Not Started" ? "info" :
              markerStatus === "Started" ? "pending" : "check_circle"}
          </Icon>
          {markerStatus === "Not Started"
            ? "Ainda não iniciado"
            : markerStatus === "Started"
              ? "Processando..."
              : "Pronto!"}
        </Typography>
      )}

      {/* === Save AR Marker to Entity === */}
      <Button
        variant="contained"
        color="primary"
        fullWidth
        sx={{ mt: 3 }}
        onClick={handleSave}
        disabled={!selectedItem}
      >
        Guardar
      </Button>
    </Box>
  );
}

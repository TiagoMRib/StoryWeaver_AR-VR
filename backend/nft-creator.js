const path = require("path");
const fs = require("fs");
const glob = require("glob");
const readlineSync = require("readline-sync");
const inkjet = require("inkjet");
const im = require("imagemagick");
const PNG = require("pngjs").PNG;

const { workerData, parentPort } = require("worker_threads");

if (typeof global.fetch !== "function") {
  global.fetch = async (url) => {
    const fs = require("fs");
    const path = require("path");
    const wasmPath = path.resolve(__dirname, "libs", "NftMarkerCreator_wasm.wasm");
    return {
      arrayBuffer: async () => fs.promises.readFile(wasmPath),
    };
  };
}

// Load WASM module
const Module = require("./libs/NftMarkerCreator_wasm.js");

let imageData = {
  sizeX: 0,
  sizeY: 0,
  nc: 0,
  dpi: 0,
  array: null,
};

let srcImage;
let buffer;

let foundInputPath = {
  b: false,
  i: -1,
};
let noConf = false;
let withDemo = false;
let onlyConfidence = false;
let isZFT = false;

const validImageExt = [".jpg", ".jpeg", ".png"];
let params = [];

const imageURL = workerData.imageURL;
let outputPath = workerData.outputPath;
const iParam = workerData.iParam;
const noConfParam = workerData.noConfParam;
const zftParam = workerData.zftParam;
const onlyConfidenceParam = workerData.onlyConfidenceParam;

Module.onRuntimeInitialized = async () => {
  try {
    console.log("=== NFT MARKER CREATOR DEBUG ===");
    console.log("1. Worker started with data:", workerData);

    if (!imageURL || !outputPath) {
      throw new Error("Missing required parameters: imageURL or outputPath");
    }

    console.log("2. Reading image file:", imageURL);
    const imageBuffer = fs.readFileSync(imageURL);

    const ext = path.extname(imageURL).toLowerCase();
    if (ext === ".jpg" || ext === ".jpeg") {
      await useJPG(imageBuffer);
    } else if (ext === ".png") {
      await usePNG(imageBuffer);
    } else {
      throw new Error("Unsupported image format. Only JPG and PNG are supported.");
    }

    console.log("3. Image processed successfully");
    console.log("   - Size:", imageData.sizeX, "x", imageData.sizeY);
    console.log("   - Channels:", imageData.nc);
    console.log("   - DPI:", imageData.dpi);

    // Generate markers
    console.log("4. Generating markers...");
    const result = await generateMarkers(
      imageURL,
      iParam,
      noConfParam,
      zftParam,
      onlyConfidenceParam
    );

    console.log("5. Marker generation complete");
    parentPort.postMessage(result);
  } catch (error) {
    console.error("ERROR in NFT Marker Creator:", error);
    parentPort.postMessage({ error: error.message });
  }
};

async function useJPG(buf) {
  inkjet.decode(buf, function (err, decoded) {
    if (err) {
      console.error("\n" + err + "\n");
      return;
    } else {
      let newArr = [];

      let verifyColorSpace = detectColorSpace(decoded.data);

      if (verifyColorSpace === 1) {
        for (let j = 0; j < decoded.data.length; j += 4) {
          newArr.push(decoded.data[j]);
        }
      } else if (verifyColorSpace === 3) {
        for (let j = 0; j < decoded.data.length; j += 4) {
          newArr.push(decoded.data[j]);
          newArr.push(decoded.data[j + 1]);
          newArr.push(decoded.data[j + 2]);
        }
      }

      let uint = new Uint8Array(newArr);
      imageData.nc = verifyColorSpace;
      imageData.array = uint;
    }
  });

  await extractExif(buf);
}

function extractExif(buf) {
  return new Promise((resolve, reject) => {
    inkjet.exif(buf, async function (err, metadata) {
      if (err) {
        console.error("\n    ERROR HAPPENED" + err + "\n");
        return;
      } else {
        if (
          metadata == null ||
          Object.keys(metadata).length === undefined ||
          Object.keys(metadata).length <= 0
        ) {
          console.log(metadata);
          let ret = await imageMagickIdentify(srcImage);
          console.log("ret:", ret);
          {
            if (ret.err) {
              console.log(ret.err);
              var answer = readlineSync.question(
                "The EXIF info of this image is empty or it does not exist. Do you want to inform its properties manually?[y/n]\n"
              );

              if (answer == "y") {
                var answerWH = readlineSync.question(
                  "Inform the width and height: e.g W=200 H=400\n"
                );

                let valWH = getValues(answerWH, "wh");
                imageData.sizeX = valWH.w;
                imageData.sizeY = valWH.h;

                var answerDPI = readlineSync.question(
                  "Inform the DPI: e.g DPI=220 [Default = 72](Press enter to use default)\n"
                );

                if (answerDPI == "") {
                  imageData.dpi = 72;
                } else {
                  let val = getValues(answerDPI, "dpi");
                  imageData.dpi = val;
                }
              } else {
                console.log("Exiting process!");
                return;
              }
            } else {
              imageData.sizeX = ret.features.width;
              imageData.sizeY = ret.features.height;
              var resolution = ret.features.resolution;
              let dpi = null;
              if (resolution) {
                let resolutions = resolution.split("x");
                if (resolutions.length === 2) {
                  dpi = Math.min(
                    parseInt(resolutions[0]),
                    parseInt(resolutions[1])
                  );
                  if (dpi == null || isNaN(dpi)) {
                    // console.log("\nWARNING: No DPI value found! Using 72 as default value!\n")
                    dpi = 72;
                  }
                }
              } else {
                dpi = 72;
              }

              imageData.dpi = dpi;
            }
          }
        } else {
          let dpi = 72;

          if (parseInt(metadata["XResolution"] != null)) {
            dpi = Math.min(
              parseInt(metadata["XResolution"].description),
              parseInt(metadata["YResolution"].description)
            );
          } else {
            console.log(
              "\nWARNING: No DPI value found! Using 72 as default value!\n"
            );
          }

          if (
            metadata["Image Width"] == null ||
            metadata["Image Width"] === undefined
          ) {
            if (
              metadata["PixelXDimension"].value == null ||
              metadata["PixelXDimension"].value === undefined
            ) {
              var answer = readlineSync.question(
                "The image does not contain any width or height info, do you want to inform them?[y/n]\n"
              );
              if (answer === "y") {
                var answer2 = readlineSync.question(
                  "Inform the width and height: e.g W=200 H=400\n"
                );

                let vals = getValues(answer2, "wh");
                imageData.sizeX = vals.w;
                imageData.sizeY = vals.h;
              } else {
                console.log(
                  "It's not possible to proceed without width or height info!"
                );
                return;
              }
            } else {
              imageData.sizeX = metadata["PixelXDimension"].value;
              imageData.sizeY = metadata["PixelYDimension"].value;
            }
          } else {
            imageData.sizeX = metadata["Image Width"].value;
            imageData.sizeY = metadata["Image Height"].value;
          }
          imageData.nc = metadata["Color Components"].value;
          imageData.dpi = dpi;
        }
      }

      resolve(true);
    });
  });
}

function usePNG(buf) {
  let data;
  var png = PNG.sync.read(buf);

  var arrByte = new Uint8Array(png.data);
  if (png.alpha) {
    data = rgbaToRgb(arrByte);
  } else {
    data = arrByte;
  }

  let newArr = [];

  let verifyColorSpace = detectColorSpace(data);

  if (verifyColorSpace === 1) {
    for (let j = 0; j < data.length; j += 4) {
      newArr.push(data[j]);
    }
  } else if (verifyColorSpace === 3) {
    for (let j = 0; j < data.length; j += 4) {
      newArr.push(data[j]);
      newArr.push(data[j + 1]);
      newArr.push(data[j + 2]);
    }
  }

  let uint = new Uint8Array(newArr);

  imageData.array = uint;
  imageData.nc = verifyColorSpace;
  imageData.sizeX = png.width;
  imageData.sizeY = png.height;
  imageData.dpi = 72;
}

function imageMagickIdentify(srcImage) {
  return new Promise((resolve, reject) => {
    im.identify(srcImage, function (err, features) {
      resolve({ err: err, features: features });
    });
  });
}

function getValues(str, type) {
  let values;
  if (type == "wh") {
    let Wstr = "W=";
    let Hstr = "H=";
    var doesContainW = str.indexOf(Wstr);
    var doesContainH = str.indexOf(Hstr);

    let valW = parseInt(str.slice(doesContainW + 2, doesContainH));
    let valH = parseInt(str.slice(doesContainH + 2));

    values = {
      w: valW,
      h: valH,
    };
  } else if (type == "nc") {
    let nc = "NC=";
    var doesContainNC = str.indexOf(nc);
    values = parseInt(str.slice(doesContainNC + 3));
  } else if (type == "dpi") {
    let dpi = "DPI=";
    var doesContainDPI = str.indexOf(dpi);
    values = parseInt(str.slice(doesContainDPI + 4));
  }

  return values;
}

function detectColorSpace(arr) {
  let target = parseInt(arr.length / 4);

  let counter = 0;

  for (let j = 0; j < arr.length; j += 4) {
    let r = arr[j];
    let g = arr[j + 1];
    let b = arr[j + 2];

    if (r === g && r === b) {
      counter++;
    }
  }

  if (target === counter) {
    return 1;
  } else {
    return 3;
  }
}

function rgbaToRgb(arr) {
  let newArr = [];
  let BGColor = {
    R: 255,
    G: 255,
    B: 255,
  };

  for (let i = 0; i < arr.length; i += 4) {
    let r = parseInt(
      255 * ((1 - arr[i + 3]) * BGColor.R + arr[i + 3] * arr[i])
    );
    let g = parseInt(
      255 * ((1 - arr[i + 3]) * BGColor.G + arr[i + 3] * arr[i + 1])
    );
    let b = parseInt(
      255 * ((1 - arr[i + 3]) * BGColor.B + arr[i + 3] * arr[i + 2])
    );

    newArr.push(r);
    newArr.push(g);
    newArr.push(b);
  }
  return newArr;
}

function calculateQuality() {
  let gray = toGrayscale(imageData.array);
  let hist = getHistogram(gray);
  let ent = 0;
  let totSize = imageData.sizeX * imageData.sizeY;
  for (let i = 0; i < 255; i++) {
    if (hist[i] > 0) {
      let temp = (hist[i] / totSize) * Math.log(hist[i] / totSize);
      ent += temp;
    }
  }

  let entropy = (-1 * ent).toFixed(2);
  let oldRange = 5.17 - 4.6;
  let newRange = 5 - 0;
  let level = ((entropy - 4.6) * newRange) / oldRange;

  if (level > 5) {
    level = 5;
  } else if (level < 0) {
    level = 0;
  }
  return { l: level.toFixed(2), e: entropy };
}

function toGrayscale(arr) {
  let gray = [];
  for (let i = 0; i < arr.length; i += 3) {
    let avg = (arr[i] + arr[i + 1] + arr[i + 2]) / 3;
    gray.push(parseInt(avg));
  }
  return gray;
}

function getHistogram(arr) {
  let hist = [256];
  for (let i = 0; i < arr.length; i++) {
    hist[i] = 0;
  }
  for (let i = 0; i < arr.length; i++) {
    hist[arr[i]]++;
  }
  return hist;
}

function addNewMarker(text, name) {
  for (let i = 0; i < text.length; i++) {
    if (text[i].trim().includes("<script>MARKER_NAME =")) {
      text[i] = "<script>MARKER_NAME = '" + name + "'</script>";
      break;
    }
  }
}

async function generateMarkers(
  imageURL,
  iParam,
  noConfParam,
  zftParam,
  onlyConfidenceParam
) {
  if (iParam) {
    foundInputPath.b = true;
  }
  if (noConfParam) {
    noConf = true;
  }
  if (zftParam) {
    isZFT = true;
  }
  if (onlyConfidenceParam) {
    onlyConfidence = true;
  }

  if (!foundInputPath.b) {
    console.log(
      "\nERROR: No image in INPUT command!\n e.g:(-i /PATH/TO/IMAGE)\n"
    );
    return;
  } else {
    srcImage = imageURL;
  }
  console.log("Set input path: " + srcImage);

  let fileNameWithExt = path.basename(srcImage);
  let fileName = path.parse(fileNameWithExt).name;
  let extName = path.parse(fileNameWithExt).ext;

  let foundExt = false;

  console.log("Check image extension: " + extName);
  for (let ext in validImageExt) {
    if (extName.toLowerCase() === validImageExt[ext]) {
      foundExt = true;
      break;
    }
  }

  if (!foundExt) {
    console.log(
      "\nERROR: Invalid image TYPE!\n Valid types:(jpg,JPG,jpeg,JPEG,png,PNG)\n"
    );
    return;
  }

  if (!fs.existsSync(srcImage)) {
    console.log(
      "\nERROR: Not possible to read image, probably invalid image PATH!\n"
    );
    return;
  } else {
    buffer = fs.readFileSync(srcImage);
  }

  console.log("Check output path: " + path.join(__dirname, outputPath));
  if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath);
  }
  if (extName.toLowerCase() === ".jpg" || extName.toLowerCase() === ".jpeg") {
    await useJPG(buffer);
  } else if (extName.toLowerCase() === ".png") {
    usePNG(buffer);
  }

  let confidence = calculateQuality();

  let txt = " - - - - - ";
  if (confidence.l != 0) {
    let str = txt.split(" ");
    str.pop();
    str.shift();
    for (let i = 0; i < parseInt(confidence.l); i++) {
      str[i] = " *";
    }
    str.push(" ");
    txt = str.join("");
  }

  if (onlyConfidence) {
    console.log("%f", confidence.l);
    return;
  }

  console.log(
    "\nConfidence level: [" +
      txt +
      "] %f/5 || Entropy: %f || Current max: 5.17 min: 4.6\n",
    confidence.l,
    confidence.e
  );

  if (noConf) {
    const answer = readlineSync.question(`\nDo you want to continue? (Y/N)\n`);

    if (answer == "n") {
      console.log("\nProcess finished by the user! \n");
      return;
    }
  }

  let paramStr = params.join(" ");

  let StrBuffer = Module._malloc(paramStr.length + 1);
  Module.writeStringToMemory(paramStr, StrBuffer);

  console.log("Write Success");
  let heapSpace = Module._malloc(
    imageData.array.length * imageData.array.BYTES_PER_ELEMENT
  );
  Module.HEAPU8.set(imageData.array, heapSpace);

  console.log("Setting Heap Success.. Continue to Create ImageSet..");
  Module._createImageSet(
    heapSpace,
    imageData.dpi,
    imageData.sizeX,
    imageData.sizeY,
    imageData.nc,
    StrBuffer
  );

  Module._free(heapSpace);
  Module._free(StrBuffer);

  let filenameIset = "tempFilename.iset";
  let filenameFset = "tempFilename.fset";
  let filenameFset3 = "tempFilename.fset3";

  let ext = ".iset";
  let ext2 = ".fset";
  let ext3 = ".fset3";

  let content = Module.FS.readFile(filenameIset);
  let contentFset = Module.FS.readFile(filenameFset);
  let contentFset3 = Module.FS.readFile(filenameFset3);

  if (isZFT) {
    console.log("CREATING ZFT FILE");
    let iset = Buffer.from(content.buffer);
    let fset = Buffer.from(contentFset.buffer);
    let fset3 = Buffer.from(contentFset3.buffer);

    let obj = {
      iset: iset.toString("hex"),
      fset: fset.toString("hex"),
      fset3: fset3.toString("hex"),
    };

    let strObj = JSON.stringify(obj);

    let StrBufferZip = Module._malloc(strObj.length + 1);
    Module.writeStringToMemory(strObj, StrBufferZip);

    Module._compressZip(StrBufferZip, strObj.length);

    let contentBin = Module.FS.readFile("tempBinFile.bin");

    fs.writeFileSync(
      path.join(__dirname, "output", fileName + ".zft"),
      contentBin
    );

    Module._free(StrBufferZip);

    if (withDemo) {
      console.log("\nFinished marker creation!\nNow configuring demo! \n");

      const markerDir = path.join(__dirname, "/demo/public/marker/");

      if (!fs.existsSync(markerDir)) {
        fs.mkdirSync(markerDir);
      }

      let demoHTML = fs
        .readFileSync("./demo/nft.html")
        .toString("utf8")
        .split("\n");
      addNewMarker(demoHTML, fileName);
      let newHTML = demoHTML.join("\n");

      fs.writeFileSync("./demo/nft.html", newHTML, {
        encoding: "utf8",
        flag: "w",
      });

      const files = fs.readdirSync(markerDir);
      for (const file of files) {
        fs.unlink(path.join(markerDir, file), (err) => {
          if (err) throw err;
        });
      }

      fs.writeFileSync(markerDir + fileName + ".zft", contentBin);

      console.log("Finished!\nTo run demo use: 'npm run demo'");
    }
  } else {
    console.log("CREATING ISET, FSET AND FSET3 FILES");
    fs.writeFileSync(
      path.join(outputPath, fileName + ext),
      content
    );
    fs.writeFileSync(
      path.join(outputPath, fileName + ext2),
      contentFset
    );
    fs.writeFileSync(
      path.join(outputPath, fileName + ext3),
      contentFset3
    );

    if (withDemo) {
      console.log("\nFinished marker creation!\nNow configuring demo! \n");

      const markerDir = path.join(__dirname, "/demo/public/marker/");

      if (!fs.existsSync(markerDir)) {
        fs.mkdirSync(markerDir);
      }

      let demoHTML = fs
        .readFileSync("./demo/nft.html")
        .toString("utf8")
        .split("\n");
      addNewMarker(demoHTML, fileName);
      let newHTML = demoHTML.join("\n");

      fs.writeFileSync("./demo/nft.html", newHTML, {
        encoding: "utf8",
        flag: "w",
      });

      const files = fs.readdirSync(markerDir);
      for (const file of files) {
        fs.unlink(path.join(markerDir, file), (err) => {
          if (err) throw err;
        });
      }

      fs.writeFileSync(markerDir + fileName + ext, content);
      fs.writeFileSync(markerDir + fileName + ext2, contentFset);
      fs.writeFileSync(markerDir + fileName + ext3, contentFset3);

      console.log("Finished!\nTo run demo use: 'npm run demo'");
    }
  }

  parentPort.postMessage({ success: true });
}

Module.onRuntimeInitialized = async () => {
  generateMarkers(imageURL, iParam, noConfParam, zftParam, onlyConfidenceParam);
};

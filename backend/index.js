// app.js
const express = require("express");
const fs = require("fs");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const cron = require("node-cron");
require("dotenv").config();
const cookieParser = require("cookie-parser");
const cleanupFiles = require("./cleanup-files");
const jwt = require("jsonwebtoken");
const secretkey = require("./config/secret.json");

const { MongoClient, ServerApiVersion } = require("mongodb");
const { randomUUID } = require("crypto");
const { OAuth2Client } = require("google-auth-library");
const unzipper = require("unzipper");

const { Worker } = require("worker_threads");

const uri =
  "mongodb+srv://Poodlers:" +
  process.env.MONGO_PASSWORD +
  "@storyweaver.6lspmuu.mongodb.net/?retryWrites=true&w=majority&appName=StoryWeaver";
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    //await client.close();
  }
}
run().catch(console.dir);

const app = express();
// Enable CORS

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 8080;

// Set storage engine for multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log("=== UPLOAD DEBUG ===");
    console.log("1. Upload request received");
    console.log("   - Request body:", req.body);
    console.log("   - File:", file);
    
    let destinationPath = path.join("files", req.body.projectID);
    const absolutePath = path.join(__dirname, destinationPath);
    
    console.log("2. Paths:");
    console.log("   - Relative path:", destinationPath);
    console.log("   - Absolute path:", absolutePath);
    
    if (!fs.existsSync(absolutePath)) {
      console.log("3. Creating directory:", absolutePath);
      fs.mkdirSync(absolutePath, { recursive: true });
    } else {
      console.log("3. Directory already exists");
    }
    
    console.log("===================");
    cb(null, destinationPath);  // Use relative path for multer
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

// Initialize multer middleware
const upload = multer({ storage: storage });

app.use(cors());
// Serve static files from the uploads directory
app.use("/files", express.static(path.join(__dirname, "files")));

app.post("/save", async (req, res) => {
  const originalStoryId = req.body.storyId;
  let storyId = originalStoryId;
  if (storyId === null || storyId === undefined) {
    storyId = randomUUID();
  }
  const storyTitle = req.body.projectTitle;
  const nodes = req.body.nodes;
  const edges = req.body.edges;
  const characters = req.body.characters;
  const maps = req.body.maps;
  const exported = req.body.exported;
  const experienceName = req.body.experienceName;
  const description = req.body.description;
  const tags = req.body.tags;
  const locations = req.body.locations || [];
  const interactions = req.body.interactions || [];

  console.log("[Index] Posting characters:", characters);
  console.log("[Index] Posting locations:", locations);
  console.log("[Index] Posting interactions:", interactions);

  //save to database
  await client
    .db("projects")
    .collection("story_structures")
    .updateOne(
      { id: originalStoryId },
      {
        $set: {
          id: storyId,
          title: storyTitle,
          nodes: nodes,
          edges: edges,
          characters: characters,
          maps: maps,         
          locations: locations,
          interactions: interactions,
          exported: exported,
          experienceName: experienceName,
          description: description,
          tags: tags,
          lastModified: new Date().toISOString(),
        },
      },
      { upsert: true }
    );

  res.send({ storyId: storyId });
});

app.get("/user-info/:email", async (req, res) => {
  const email = req.params.email;
  const user = await client
    .db("users")
    .collection("login")
    .findOne({ email: email });

  res.send(user);
});

app.get("/projects/:searchString", async (req, res) => {
  const searchString = req.params.searchString;
  const projects = await client
    .db("projects")
    .collection("exported_stories")
    .find({ experienceName: { $regex: searchString, $options: "i" } })
    .project({ id: 1, title: 1, experienceName: 1, description: 1, tags: 1 })
    .toArray();
  res.send(projects);
});

app.get("/projects", async (req, res) => {
  const projects = await client
    .db("projects")
    .collection("story_structures")
    .find({})
    .project({ id: 1, title: 1 })
    .toArray();
  res.send(projects);
});

app.get("/exported-projects", async (req, res) => {
  const projects = await client
    .db("projects")
    .collection("exported_stories")
    .find({})
    .project({ id: 1, title: 1, experienceName: 1, description: 1, tags: 1 })
    .toArray();
  console.log(projects);
  res.send(projects);
});

app.get("/load/:storyId", async (req, res) => {
  const storyId = req.params.storyId;
  const story = await client
    .db("projects")
    .collection("story_structures")
    .findOne({ id: storyId });
  res.send(story);
});

app.post("/export", async (req, res) => {
  const originalStoryId = req.body.storyId;
  const storyTitle = req.body.projectTitle;
  const nodes = req.body.nodes;

  const edges = req.body.edges;
  const characters = req.body.characters;
  const maps = req.body.maps;
  
  const locations = req.body.locations || [];
  const interactions = req.body.interactions || [];

  const experienceName = req.body.experienceName;
  const description = req.body.description;
  const tags = req.body.tags;
  let storyId = originalStoryId;
  const storyEndings = req.body.endings;

  console.log("[Index] Posting characters:", characters);
  console.log("[Index] Posting locations:", locations);
  console.log("[Index] Posting interactions:", interactions);

  //save to story_structures database
  await client
    .db("projects")
    .collection("story_structures")
    .updateOne(
      { id: originalStoryId },
      {
        $set: {
          id: storyId,
          title: storyTitle,
          nodes: nodes,
          edges: edges,
          characters: characters,
          maps: maps,
          
          locations: locations,
          interactions: interactions,
          experienceName: experienceName,
          description: description,
          tags: tags,
          storyEndings: storyEndings,
          lastModified: new Date().toISOString(),
        },
      },
      { upsert: true }
    );

  await client
    .db("projects")
    .collection("exported_stories")
    .updateOne(
      { id: originalStoryId },
      {
        $set: {
          id: storyId,
          title: storyTitle,
          nodes: nodes,
          edges: edges,
          characters: characters,
          maps: maps,
          locations: locations,
          interactions: interactions,
          
          experienceName: experienceName,
          description: description,
          tags: tags,
          storyEndings: storyEndings,
          lastModified: new Date().toISOString(),
        },
      },
      { upsert: true }
    );
  res.send({ storyId: storyId });
});

app.delete("/delete/:storyId", async (req, res) => {
  const storyId = req.params.storyId;
  await client
    .db("projects")
    .collection("story_structures")
    .deleteOne({ id: storyId });

  //delete the folder containing the files for this project
  const folderPath = path.join(__dirname, "files", storyId);
  if (fs.existsSync(folderPath)) {
    fs.rmdirSync(folderPath, { recursive: true });
  }
  await client
    .db("projects")
    .collection("exported_stories")
    .deleteOne({ id: storyId });

  await client
    .db("users")
    .collection("login")
    .updateMany(
      {},
      {
        $pull: { endings: { storyId: storyId } },
      }
    );

  res.send({ success: true });
});

// Handle file upload
app.post(
  "/upload",
  upload.fields([{ name: "file" }, { name: "projectID" }]),
  (req, res) => {
    console.log("[UPLOAD POST] Received upload:", req.body, req.files);
    
    // Log the final file location
    if (req.files && req.files.file && req.files.file[0]) {
      const uploadedFile = req.files.file[0];
      console.log("Uploaded file location:", path.resolve(uploadedFile.path));
    }
    
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Headers", "content-type");

    res.json({ success: true });
  }
);

app.get("/unzip/:storyID/:filename", async (req, res) => {
  const filename = req.params.filename;
  const storyID = req.params.storyID;
  const filePath = path.join(__dirname, "files", storyID, filename);

  const fileNameWithoutExtension = filename.split(".")[0];
  const outputPath = path.join(
    __dirname,
    "files",
    storyID,
    fileNameWithoutExtension
  );
  if (fs.existsSync(outputPath)) {
    console.log("Unzipped files already exist for this image");
    res.json({ success: true });
    return;
  } else {
    fs.mkdirSync(outputPath, { recursive: true });
  }

  const stream = fs
    .createReadStream(filePath)
    .pipe(unzipper.Extract({ path: outputPath }));

  stream.on("close", () => {
    res.json({ success: true });
  });

  stream.on("error", (err) => {
    res.json({ success: false, error: err });
  });
});

// Function to generate marker files using Worker
async function generateMarkerFiles(imagePath) {
  return new Promise((resolve, reject) => {
    console.log("=== GENERATE MARKER FILES DEBUG ===");
    console.log("1. Starting worker with image path:", imagePath);
    
    const outputPath = path.join(path.dirname(imagePath));
    console.log("2. Output path:", outputPath);
    
    const worker = new Worker(path.join(__dirname, "nft-creator.js"), {
      workerData: {
        imageURL: imagePath,
        outputPath: outputPath,
        iParam: true,
        noConfParam: false,
        zftParam: false,
        onlyConfidenceParam: false,
      },
    });

    worker.on("message", (data) => {
      console.log("3. Worker completed successfully:", data);
      resolve(data);
    });

    worker.on("error", (error) => {
      console.error("3. Worker error:", error);
      reject(error);
    });

    worker.on("exit", (code) => {
      if (code !== 0) {
        console.error(`3. Worker stopped with exit code ${code}`);
        reject(new Error(`Worker stopped with exit code ${code}`));
      }
    });
  });
}

// Generate marker files endpoint
app.get("/generateMarker/:storyID/:fileName", async (req, res) => {
  console.log("=== MARKER GENERATION DEBUG ===");
  console.log("1. Request received:", req.params);
  
  const { storyID, fileName } = req.params;
  const filePath = path.join("files", storyID, fileName);
  const absoluteFilePath = path.join(__dirname, filePath);
  
  console.log("2. Paths:");
  console.log("   - Relative path:", filePath);
  console.log("   - Absolute path:", absoluteFilePath);
  
  // Check if file exists
  if (!fs.existsSync(absoluteFilePath)) {
    console.log("3. Error: File not found at", absoluteFilePath);
    return res.status(404).json({ error: "File not found" });
  }
  
  console.log("3. File found, proceeding with marker generation");
  
  try {
    // Generate marker files
    const markerFiles = await generateMarkerFiles(absoluteFilePath);
    console.log("4. Marker generation successful:", markerFiles);
    res.json({ success: true, files: markerFiles });
  } catch (error) {
    console.error("4. Error generating marker:", error);
    res.status(500).json({ error: "Failed to generate marker files" });
  }
});

// Define a route to handle DELETE requests for files by name
app.delete("/files/:storyID/:filename", (req, res) => {
  const filename = req.params.filename;
  const storyID = req.params.storyID;
  const filePath = path.join(__dirname, "files", storyID, filename);
  const fileNameWithoutExtension = filename.split(".")[0];
  if (filename.includes(".zip")) {
    const outputPath = path.join(
      __dirname,
      "files",
      storyID,
      fileNameWithoutExtension
    );
    fs.rmdirSync(outputPath, { recursive: true });
  }
  const filePathFSET = path.join(
    __dirname,
    "files",
    storyID,
    fileNameWithoutExtension + ".fset"
  );
  fs.unlink(filePathFSET, (err) => {
    if (err) {
      console.error("Error deleting file:", err);
    } else {
      console.log("File deleted successfully.");
    }
  });
  const filePathISET = path.join(
    __dirname,
    "files",
    storyID,
    fileNameWithoutExtension + ".iset"
  );
  fs.unlink(filePathISET, (err) => {
    if (err) {
      console.error("Error deleting file:", err);
    } else {
      console.log("File deleted successfully.");
    }
  });
  const filePathFSET3 = path.join(
    __dirname,
    "files",
    storyID,
    fileNameWithoutExtension + ".fset3"
  );
  fs.unlink(filePathFSET3, (err) => {
    if (err) {
      console.error("Error deleting file:", err);
    } else {
      console.log("File deleted successfully.");
    }
  });

  // Delete the file
  fs.unlink(filePath, (err) => {
    if (err) {
      console.error("Error deleting file:", err);
      res.status(404).send("File not found");
    } else {
      console.log("File deleted successfully.");
      res.send("File deleted successfully.");
    }
  });
});

// Define a route to handle GET requests for files by name
app.get("/files/:storyID/:filename", (req, res) => {
  const filename = req.params.filename;
  const storyID = req.params.storyID;
  // Set the appropriate content type based on the file extension
  const contentType = getContentType(filename);
  res.setHeader("Content-Type", contentType);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Headers", "content-type");

  // Serve the file from the 'uploads' directory
  res.sendFile(path.join(__dirname, "files", storyID, filename), (err) => {
    if (err) {
      console.error("Error serving file:", err);
      res.status(404).send("File not found");
    }
  });
});

// Function to determine content type based on file extension
function getContentType(filename) {
  const ext = path.extname(filename).toLowerCase();
  switch (ext) {
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".png":
      return "image/png";
    case ".gif":
      return "image/gif";
    case ".mp4":
      return "video/mp4";
    case ".pdf":
      return "application/pdf";
    default:
      return "application/octet-stream";
  }
}

app.post("/finish-story", async (req, res) => {
  const storyId = req.body.storyId;
  const experienceName = req.body.experienceName;
  const userEmail = req.body.userEmail;
  const endingToAdd = req.body.ending;
  const allEndings = req.body.allEndings;
  const collection = client.db("users").collection("login");

  const document = await collection.findOne({ email: userEmail });

  let storyExists = false;
  let endingExists = false;

  if (document) {
    document.endings.forEach((ending) => {
      if (ending.storyId === storyId) {
        storyExists = true;
        if (ending.endingsSeen.includes(endingToAdd)) {
          endingExists = true;
        }
      }
    });
  }

  if (!storyExists) {
    // If storyId does not exist, add the new object to the endings array
    await collection.updateOne(
      { email: userEmail },
      {
        $push: {
          endings: {
            storyId: storyId,
            endingsSeen: [endingToAdd],
            allEndings: allEndings,
            experienceName: experienceName,
            lastPlayed: new Date().toISOString(),
          },
        },
      }
    );
    console.log("New story added with the ending");
  } else if (!endingExists) {
    // If storyId exists but endingToAdd does not exist in endingsSeen, add the ending
    await collection.updateOne(
      { email: userEmail, "endings.storyId": storyId },
      {
        $addToSet: { "endings.$.endingsSeen": endingToAdd },
        $set: {
          "endings.$.lastPlayed": new Date().toISOString(),
          "endings.$.allEndings": allEndings,
          "endings.$.experienceName": experienceName,
        },
      }
    );
  } else {
    await collection.updateOne(
      { email: userEmail, "endings.storyId": storyId },
      {
        $set: {
          "endings.$.lastPlayed": new Date().toISOString(),
          "endings.$.allEndings": allEndings,
          "endings.$.experienceName": experienceName,
        },
      }
    );
    console.log("Ending already exists in the story");
  }

  res.send({ success: true });
});

app.post("/login/user", async (req, res) => {
  const OAuthClient = new OAuth2Client(process.env.CLIENT_ID);
  const { authId } = req.body;

  try {
    //check if passed token is valid
    const ticket = await OAuthClient.verifyIdToken({
      idToken: authId,
      audience: process.env.CLIENT_ID,
    });

    //get metadata from the id token, to be saved in the db
    const { name, email, picture } = ticket.getPayload();

    //this value will be passed thru cookie
    const loginToken = jwt.sign(`${email}`, secretkey.key);
    await client
      .db("users")
      .collection("login")
      .updateOne(
        { email: email },
        {
          $set: {
            email: email,
            name: name,
            picture: picture,
          },

          $setOnInsert: {
            endings: [],
          },
        },
        { upsert: true }
      );

    //creating a cookie name "login", which will expire after 360000 milliseconds from the time of creation
    //the value of the cookie is a jwt, created using the email id of the google user
    //later on each call we will deconde this message using secret key and check if user is authenticated

    res.status(200).send({
      success: true,
      loginToken: loginToken,
      name: name,
      email: email,
      picture: picture,
    });
  } catch (e) {
    console.log(e);
    res.status(500).send({
      error: e,
    });
  }
});

const authenticateUser = async (req, res, next) => {
  try {
    let idToken = req.body.loginToken;

    const decodedMessage = jwt.verify(idToken, secretkey.key);
    await client.db("users").collection("login").findOne({
      email: decodedMessage,
    });
    next();
  } catch (e) {
    console.log(e);
    res.status(401).send({
      error: e,
    });
  }
};

app.post("/user/authenticated/getAll", authenticateUser, async (req, res) => {
  //authenticateUser is the middleware where we check if the use is valid/loggedin
  try {
    const data = await client.db("users").collection("login").find().toArray();
    res.status(200).send({
      users: data,
    });
  } catch (e) {
    res.status(500).send({
      error: e,
    });
  }
});

app.get("/logout/user", async (req, res) => {
  //logout function
  try {
    res.send({
      success: true,
    });
  } catch (e) {
    res.status(500).send({
      error: e,
    });
  }
});

app.post("/user/checkLoginStatus", authenticateUser, async (req, res) => {
  //check if user is logged in already
  try {
    res.status(200).send({
      success: true,
    });
  } catch (e) {
    res.status(500).send({
      error: e,
    });
  }
});

// Start the server
app.listen(PORT, () => {
  // Schedule a cron job to run every day at midnight
  cron.schedule("0 0 * * *", () => {
    console.log("Running file cleanup task...");
    //cleanupFiles(path.join(__dirname, "files"));
  });
  console.log(`Server is running on http://localhost:${PORT}`);
});

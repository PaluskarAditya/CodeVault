const express = require("express");
const hashPass = require("./utils/hash");
const comparePass = require("./utils/compare");
const app = express();
const cors = require("cors");
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const connectDB = require("./utils/db");
const Snippet = require("./models/snippet");
const io = new Server(server, {
  cors: {
    origin: ["*"],
    methods: ["GET", "POST"],
  },
});
require("dotenv").config();

connectDB();
app.use(express.json());
app.use(cors());
app.set("io", io);

// @GET - Test Route
app.get("/foo", (req, res) => res.send("bar"));

// @POST - Create Snippet
app.post("/api/create", async (req, res) => {
  try {
    const { uuid, lang, pass, visibility, name, desc, code, expiry } = req.body;

    if (!uuid || !lang || !name || !code) {
      return res.status(400).json({ err: "Specified fields required" });
    }

    const existingSnippet = await Snippet.findOne({ uuid });

    if (!existingSnippet) {
      const newSnippet = await Snippet.create({
        uuid,
        lang,
        visibility,
        code,
        expiry,
        name,
        description: desc,
        pass: pass ? await hashPass(pass) : undefined,
      });

      return res.status(200).json({ success: true, snippet: newSnippet });
    }

    // Snippet exists → update
    const updateFields = {
      code,
      name,
      description: desc,
      visibility,
      lang,
      expiry,
    };

    if (pass) {
      updateFields.pass = await hashPass(pass);
    }

    const updatedSnippet = await Snippet.findOneAndUpdate(
      { uuid },
      updateFields,
      { new: true }
    );

    return res.status(200).json({ success: true, snippet: updatedSnippet });
  } catch (error) {
    return res.status(500).json({ err: error.message });
  }
});

// @GET - Get Snippet through UUID
app.get("/api/snipp", async (req, res) => {
  res.set("Cache-Control", "no-store");
  try {
    const { id } = req.headers;

    if (!id) {
      return res.status(400).json({ err: "No id mentioned" });
    }

    const snipp = await Snippet.findOne({ uuid: id });

    if (!snipp) {
      return res.status(404).json({ err: "No Snipp found" }); // ✅ Add return
    }

    const today = new Date().toISOString().split("T")[0];
    const expiry = new Date(snipp.expiry).toISOString().split("T")[0];

    if (expiry && isNaN(new Date(expiry).getTime())) {
      return res.status(400).json({ err: "Invalid expiry date format" });
    }

    if (today > expiry) {
      return res.status(410).json({ err: "Snippet expired" });
    }

    return res.status(200).json({ success: true, snipp });
  } catch (error) {
    return res.status(500).json({ err: error.message });
  }
});

// @POST - Verify Password Protected Snippets
app.post("/api/verify-password", async (req, res) => {
  try {
    const { id, password } = req.body;

    if (!id) return res.status(400).json({ error: "Snippet ID required" });
    if (!password) return res.status(400).json({ error: "Password required" });

    const snipp = await Snippet.findOne({ uuid: id });
    if (!snipp) return res.status(404).json({ error: "Snippet not found" });

    // If no password protection
    if (!snipp.pass) return res.status(200).json({ success: true });

    // Compare passwords
    const isMatch = await comparePass(password, snipp.pass);
    console.log("Comparing:", {
      input: password,
      storedHash: snipp.pass,
      match: isMatch,
    });
    if (!isMatch) return res.status(401).json({ error: "Incorrect password" });

    // Return full snippet data after verification
    return res.status(200).json({
      success: true,
      snippet: snipp,
    });
  } catch (error) {
    console.error("Verification error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

server.listen(process.env.NODE_PORT, () =>
  console.log(`Server running on ${process.env.NODE_PORT}`)
);

const express = require("express");
const multer = require("multer");
const fetch = require("node-fetch");
const fs = require("fs");

const app = express();
const upload = multer({ dest: "uploads/" });

// GitHub repo config
const GITHUB_TOKEN = "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";
const REPO_OWNER = "anthony-roger1234";
const REPO_NAME = "rashiarchive69";
const BRANCH = "main"; // your branch
const IMAGES_FOLDER = "images"; // folder in repo to save images

app.use(express.static("public"));

app.post("/upload", upload.single("file"), async (req, res) => {
  const password = req.body.password;
  const correctPassword = "1234";
  if (password !== correctPassword)
    return res.status(401).json({ error: "Wrong password" });

  const file = req.file;
  if (!file) return res.status(400).json({ error: "No file uploaded" });

  const fileContent = fs.readFileSync(file.path, { encoding: "base64" });
  const githubPath = `${IMAGES_FOLDER}/${file.originalname}`;

  try {
    // Check if file exists to get SHA
    let sha;
    const getRes = await fetch(
      `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${githubPath}`,
      {
        headers: { Authorization: `token ${GITHUB_TOKEN}` },
      }
    );

    if (getRes.status === 200) {
      const data = await getRes.json();
      sha = data.sha;
    }

    // Create or update file
    const commitRes = await fetch(
      `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${githubPath}`,
      {
        method: "PUT",
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: `Upload ${file.originalname}`,
          content: fileContent,
          branch: BRANCH,
          sha: sha || undefined,
        }),
      }
    );

    fs.unlinkSync(file.path); // delete temp file

    const rawUrl = `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/${BRANCH}/${IMAGES_FOLDER}/${file.originalname}`;
    res.json({ url: rawUrl, name: file.originalname });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "GitHub upload failed" });
  }
});

app.listen(3000, () =>
  console.log("Server running on http://localhost:3000")
);

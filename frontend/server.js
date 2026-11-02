const express = require("express");
const path = require("path");

const app = express();
const buildDirectory = path.join(__dirname, "dist");

app.use(express.static(buildDirectory));
app.use((req, res) => {
  res.sendFile(path.join(buildDirectory, "index.html"));
});

const port = process.env.PORT || 3000;

app.listen(port, "0.0.0.0", () => {
  console.log(`Frontend server running on port ${port}`);
});
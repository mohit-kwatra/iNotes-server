const express = require("express");
const cors = require("cors");
const db = require("./database/config");
const authRouter = require("./routes/auth");
const notesRouter = require("./routes/notes");
const dotenv = require("dotenv");
dotenv.config();

/**
 * Database
 */
db.connect();

/**
 * Server
 */
const app = express();
const port = parseInt(process.env.PORT) || 5000;

app.use(express.json());
app.use(cors());
app.listen(port, () => {
  console.log(`[+] Server listening on port ${port}.`);
});

/**
 * Routes
 */
app.use("/api/auth", authRouter);
app.use("/api/notes", notesRouter);
app.use((req, res) =>
  res
    .status(404)
    .json({ status: 404, statusText: `Cannot ${req.method} ${req.url}` })
);

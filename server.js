import "dotenv/config";
import express from "express";
import session from "express-session";
import mongoose from "mongoose";
import conversionRoutes from "./routes/conversionRoutes.js";
import pageRoutes from "./routes/pageRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import { connectDB } from "./db.js";

const app = express();
const PORT = 3000; // This can be altered to a more preferable port if desired

// the session secret and the database url both come from the environment
const SECRET = process.env.SESSION_SECRET;
if (!SECRET) {
  console.error("SESSION_SECRET is not set. Copy .env.example to .env first.");
  process.exit(1);
}

// Server paths, and actions

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static("public"));

// signed session cookie, editing it by hand will not make you somebody else
app.use(
  session({
    name: "sid",
    secret: SECRET,
    resave: false,
    saveUninitialized: false,
    httpOnly: true,
    sameSite: "lax",
  }),
);

app.get("/health", async (req, res) => {
  const databaseIsUp = mongoose.connection.readyState === 1;
  const healthy = databaseIsUp;

  res.status(healthy ? 200 : 503).json({
    status: healthy ? "UP" : "DEGRADED",
    db: databaseIsUp ? "connected" : "disconnected",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

app.use("/", authRoutes);
app.use("/", pageRoutes);
app.use("/about", conversionRoutes);
app.use("/conversions", conversionRoutes);

app.use((req, res) => {
  res.status(404).json({ message: "page not found." });
});

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Listening on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("no db: ", err.message);
    process.exit(1);
  });

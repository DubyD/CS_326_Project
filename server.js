import express from "express";
import conversionRoutes from "./routes/conversionRoutes.js";
import pageRoutes from "./routes/pageRoutes.js";

const app = express();
const PORT = 3000; // This can be altered to a more preferable port if desired

// Server paths, and actions

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.static("public"));

app.use("/", pageRoutes);
app.use("/about", conversionRoutes);
app.use("/conversions", conversionRoutes);

app.use((req, res) => {
  res.status(404).json({ message: "page not found." });
});

app.listen(PORT, () => {
  console.log(`Listening on http://localhost:${PORT}`);
});

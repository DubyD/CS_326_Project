import express from "express";
import conversionRoutes from "./routes/conversionRoutes.js";
import pageRoutes from "./routes/pageRoutes.js";

const app = express();
const PORT = 3000; // This can be altered to a more preferable port if desired
app.use(express.static("public"));

/**
 * Handler methods
 */

const homePageHandler = (req, res) => {
  res.render("index");
};

const aboutPageHandler = (req, res) => {
  res.render("about", {
    title: "About",
    body: "We want to translate compiled and then decompiled code into C language. We utilized open sourced compilers and decompilers and are going to use Ai to rewrite the product into a human readable doc.",
  });
};

/**
 * Server paths, and actions
 */

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.static("public"));

app.get("/", homePageHandler);
app.get("/about", aboutPageHandler);

app.use((req, res) => {
  res.status(404).json({ message: "page not found." });
});

app.listen(PORT, () => {
  console.log(`Listening on http://localhost:${PORT}`);
});

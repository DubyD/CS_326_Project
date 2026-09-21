import express from "express";

const app = express();
const PORT = 3000; // This can be altered to a more preferable port if desired

/**
 * Handler methods
 */

const homePageHandler = (req, res) => {
  res.send(
    "Welcome! This is a project that translates code from different languages (such as Python) into C, using open-source compilers and decompilers.",
  );
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
app.get("/", homePageHandler);

app.get("/about", aboutPageHandler);

app.listen(PORT, () => {
  console.log(`Listening on http://localhost:${PORT}`);
});

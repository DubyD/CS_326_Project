import express from "express";

const app = express();
app.use(express.static("public"));

const PORT = 3000; // This can be altered to a more preferable port if desired

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
app.get("/", homePageHandler);

app.get("/about", aboutPageHandler);

app.listen(PORT, () => {
  console.log(`Listening on http://localhost:${PORT}`);
});

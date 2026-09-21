import express from "express";
const app = express();
const PORT = 3000;
app.set("view engine", "ejs");
app.get("/", (req, res) => {
  res.send("Hello, web!");
});

app.get("/about", (req, res) => {
  res.render("about", {
    title: "About",
    body: "We want to translate compiled and then decompiled code into C language. We utilized open sourced compilers and decompilers and are going to use Ai to rewrite the product into a human readable doc.",
  });
});

app.listen(PORT, () => {
  console.log(`Listening on http://localhost:${PORT}`);
});

const app = express()
app.set("view engine", "ejs");
app.get("/about", (req, res) => {
  res.render("about", { title: "About" });
});
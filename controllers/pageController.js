export const homePage = (req, res) => {
  res.render("index");
};

export const aboutPage = (req, res) => {
  res.render("about", {
    title: "About",
    body: "We want to translate compiled and then decompiled code into C language. We utilized open sourced compilers and decompilers and are going to use Ai to rewrite the product into a human readable doc.",
  });
};

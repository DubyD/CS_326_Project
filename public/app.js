const form = document.getElementById("converterForm");
const result = document.getElementById("result");
const errorMessage = document.getElementById("errorMessage");

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const language = document.getElementById("language").value;
  const sourceCode = document.getElementById("sourceCode").value;

  errorMessage.textContent = "";
  result.textContent = "Converting...";

  if (!sourceCode.trim()) {
    errorMessage.textContent = "Please enter code to convert.";
    result.textContent = "";
    return;
  }

  try {
    const response = await fetch("/conversions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        language: language,
        sourceCode: sourceCode
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Conversion failed.");
    }

    result.textContent = data.convertedCode || "No converted code returned.";

  } catch (error) {
    result.textContent = "";
    errorMessage.textContent = error.message || "Unable to reach the server.";
  }
});
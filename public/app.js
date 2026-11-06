const form = document.getElementById("converterForm");
const result = document.getElementById("result");
const errorMessage = document.getElementById("errorMessage");
const historyList = document.getElementById("historyList");
async function refreshHistory() {
  try {
    const res = await fetch("/conversions");
    if (!res.ok) return;
    const conversions = await res.json();

    historyList.innerHTML = "";
    for (const c of conversions) {
      const li = document.createElement("li");
      li.className = "history-item";
      li.dataset.id = c._id;

      const date = new Date(c.createdAt).toLocaleString();
      const title = document.createElement("button");
      title.className = "history-view";
      title.type = "button";
      title.textContent = `${c.language} — ${date}`;
      title.addEventListener("click", () => viewConversion(c._id));

      const del = document.createElement("button");
      del.className = "history-delete";
      del.type = "button";
      del.textContent = "Delete";
      del.setAttribute("aria-label", "Delete this conversion");
      del.addEventListener("click", () => deleteConversion(c._id));

      li.appendChild(title);
      li.appendChild(del);
      historyList.appendChild(li);
    }
  } catch (err) {
    console.error("no conversions", err);
  }
}

// View by id
async function viewConversion(id) {
  try {
    const res = await fetch(`/conversions/${id}`);
    if (!res.ok) {
      errorMessage.textContent = `no conversions`;
      return;
    }
    const c = await res.json();
    result.textContent = c.convertedCode;
    errorMessage.textContent = "";
  } catch (err) {
    errorMessage.textContent = err.message;
  }
}

// Delete by id
async function deleteConversion(id) {
  try {
    const res = await fetch(`/conversions/${id}`, { method: "DELETE" });
    if (res.status !== 200 && res.status !== 204) {
      errorMessage.textContent = `no conversions`;
      return;
    }
    await refreshHistory();
  } catch (err) {
    errorMessage.textContent = err.message;
  }
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const language = document.getElementById("language").value;
  const sourceCode = document.getElementById("sourceCode").value;

  errorMessage.textContent = "";
  result.textContent = "Converting...";

  if (!sourceCode.trim()) {
    errorMessage.textContent = "Enter something";
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
      throw new Error();
    }

    result.textContent = data.convertedCode;
    await refreshHistory();
  } catch (error) {
    result.textContent = "";
    errorMessage.textContent = error.message;
  }
});
refreshHistory();
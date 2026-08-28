const BACKEND_URL = window.BRAVA_BACKEND_URL || "http://localhost:3000";

const ideaListEl = document.getElementById("idea-list");
const listStatusEl = document.getElementById("list-status");
const refreshBtn = document.getElementById("refresh-btn");
const detailEmpty = document.getElementById("detail-empty");
const detailContent = document.getElementById("detail-content");
const detailMarkdown = document.getElementById("detail-markdown");

let activeFilename = null;

async function loadIdeaList() {
  listStatusEl.textContent = "Loading…";
  ideaListEl.innerHTML = "";

  try {
    const response = await fetch(`${BACKEND_URL}/api/ideas`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to load ideas.");
    }

    if (data.ideas.length === 0) {
      listStatusEl.textContent = "No ideas saved yet.";
      return;
    }

    listStatusEl.textContent = "";
    data.ideas.forEach((filename) => {
      const li = document.createElement("li");
      li.className = "idea-list-item";
      li.textContent = filename.replace(/\.md$/, "");
      li.dataset.filename = filename;
      li.addEventListener("click", () => selectIdea(filename));
      ideaListEl.appendChild(li);
    });
  } catch (err) {
    console.error("Failed to load idea list:", err);
    listStatusEl.textContent = "Couldn't reach the server — is the backend running?";
  }
}

async function selectIdea(filename) {
  activeFilename = filename;

  document.querySelectorAll(".idea-list-item").forEach((item) => {
    item.classList.toggle("active", item.dataset.filename === filename);
  });

  try {
    const response = await fetch(`${BACKEND_URL}/api/ideas/${encodeURIComponent(filename)}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to load idea.");
    }

    detailMarkdown.textContent = data.content;
    detailEmpty.hidden = true;
    detailContent.hidden = false;
  } catch (err) {
    console.error("Failed to load idea:", err);
    detailMarkdown.textContent = "Couldn't load this idea.";
    detailEmpty.hidden = true;
    detailContent.hidden = false;
  }
}

refreshBtn.addEventListener("click", loadIdeaList);

loadIdeaList();

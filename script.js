const API_BASE = "https://minepulse-h6zl.onrender.com";

/* ELEMENTS */
const input = document.getElementById("serverIP");
const searchBtn = document.getElementById("searchBtn");
const favBtn = document.getElementById("favBtn");

const statusBox = document.getElementById("status");

const card = document.getElementById("card");
const icon = document.getElementById("icon");
const nameEl = document.getElementById("name");
const motd = document.getElementById("motd");
const players = document.getElementById("players");
const ping = document.getElementById("ping");

const favList = document.getElementById("favList");
const histList = document.getElementById("histList");
const trendList = document.getElementById("trendList");
const copyBtn = document.getElementById("copyBtn");

/* STATE */
let fav = JSON.parse(localStorage.getItem("fav")) || [];
let hist = JSON.parse(localStorage.getItem("hist")) || [];

/* TOAST SYSTEM (NEW v8) */
function toast(msg) {
  let t = document.createElement("div");
  t.className = "toast";
  t.textContent = msg;

  document.body.appendChild(t);

  setTimeout(() => {
    t.classList.add("show");
  }, 10);

  setTimeout(() => {
    t.classList.remove("show");
    setTimeout(() => t.remove(), 300);
  }, 2000);
}

/* SAVE */
function save() {
  localStorage.setItem("fav", JSON.stringify(fav));
  localStorage.setItem("hist", JSON.stringify(hist));
}

/* RENDER */
function render() {
  favList.innerHTML = "";
  histList.innerHTML = "";
  trendList.innerHTML = "";

  fav.forEach(x => addItem(favList, x));
  hist.forEach(x => addItem(histList, x));

  loadTrending();
}

function addItem(parent, value) {
  const li = document.createElement("li");
  li.textContent = value;

  li.onclick = () => {
    input.value = value;
    fetchServer(value);
  };

  parent.appendChild(li);
}

/* TRENDING */
async function loadTrending() {
  try {
    const res = await fetch(`${API_BASE}/api/trending`);
    const data = await res.json();

    trendList.innerHTML = "";

    data.forEach(item => {
      const li = document.createElement("li");
      li.textContent = `${item.ip} • ${item.score}`;

      li.onclick = () => {
        input.value = item.ip;
        fetchServer(item.ip);
      };

      trendList.appendChild(li);
    });
  } catch (e) {}
}

/* FAVORITE */
favBtn.onclick = () => {
  if (!input.value) return;
  if (!fav.includes(input.value)) fav.push(input.value);
  save();
  render();
  toast("Added to favorites ⭐");
};

/* SEARCH */
searchBtn.onclick = () => fetchServer(input.value);

input.addEventListener("keydown", e => {
  if (e.key === "Enter") fetchServer(input.value);
});

/* COPY IP (v8 upgraded) */
copyBtn?.addEventListener("click", () => {
  if (!nameEl.textContent) return;

  navigator.clipboard.writeText(nameEl.textContent);

  toast(`Copied: ${nameEl.textContent} 📋`);
});

/* MAIN FETCH */
async function fetchServer(ip) {
  if (!ip) return;

  statusBox.textContent = "Scanning...";
  card.classList.add("hidden");

  hist.unshift(ip);
  hist = [...new Set(hist)].slice(0, 10);
  save();
  render();

  try {
    const res = await fetch(`${API_BASE}/api/server?ip=${ip}`);
    const data = await res.json();

    if (!data.online) {
      statusBox.textContent = "Offline / Not Found";
      toast("Server offline ❌");
      return;
    }

    card.classList.remove("hidden");
    card.classList.add("show"); // animation hook

    icon.src = data.icon || "";
    nameEl.textContent = ip;

    motd.textContent = data.motd;
    players.textContent = `Players: ${data.players}`;
    ping.textContent = `Ping: ${data.ping}ms`;

    statusBox.textContent = `Online • Score ${data.score}`;

    toast("Server loaded ⚡");

  } catch (e) {
    statusBox.textContent = "Network error";
    toast("Connection failed ❌");
  }
}

render();
loadTrending();
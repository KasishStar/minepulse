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

/* =========================
   TOAST SYSTEM (v9 CORE)
========================= */
function toast(msg, type = "info") {
  const t = document.createElement("div");
  t.className = `toast ${type}`;
  t.textContent = msg;

  document.body.appendChild(t);

  requestAnimationFrame(() => t.classList.add("show"));

  setTimeout(() => {
    t.classList.remove("show");
    setTimeout(() => t.remove(), 300);
  }, 1800);
}

/* =========================
   SAVE STATE
========================= */
function save() {
  localStorage.setItem("fav", JSON.stringify(fav));
  localStorage.setItem("hist", JSON.stringify(hist));
}

/* =========================
   RENDER LISTS (optimized)
========================= */
function renderList(el, arr) {
  el.innerHTML = "";

  arr.slice(0, 10).forEach(value => {
    const li = document.createElement("li");
    li.textContent = value;

    li.onclick = () => {
      input.value = value;
      fetchServer(value);
    };

    el.appendChild(li);
  });
}

function render() {
  renderList(favList, fav);
  renderList(histList, hist);
  loadTrending();
}

/* =========================
   TRENDING
========================= */
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
  } catch {
    /* silent fail */
  }
}

/* =========================
   FAVORITE
========================= */
favBtn.onclick = () => {
  if (!input.value) return;

  if (!fav.includes(input.value)) {
    fav.push(input.value);
    save();
    render();
    toast("Added to favorites ⭐", "success");
  }
};

/* =========================
   SEARCH
========================= */
searchBtn.onclick = () => fetchServer(input.value);

input.addEventListener("keydown", e => {
  if (e.key === "Enter") fetchServer(input.value);
});

/* =========================
   COPY SYSTEM (v9 upgraded)
========================= */
function copyToClipboard(text) {
  if (!text) return false;

  try {
    navigator.clipboard.writeText(text);
    return true;
  } catch {
    /* fallback */
    const temp = document.createElement("textarea");
    temp.value = text;
    document.body.appendChild(temp);
    temp.select();
    document.execCommand("copy");
    temp.remove();
    return true;
  }
}

copyBtn?.addEventListener("click", () => {
  const ip = nameEl.textContent;

  if (!ip) return;

  const ok = copyToClipboard(ip);

  if (ok) {
    toast(`Copied: ${ip} 📋`, "success");
  } else {
    toast("Copy failed ❌", "error");
  }
});

/* =========================
   MAIN FETCH (v9 stabilized)
========================= */
let lastIP = null;

async function fetchServer(ip) {
  if (!ip || ip === lastIP) return;

  lastIP = ip;

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
      toast("Server offline ❌", "error");
      return;
    }

    card.classList.remove("hidden");
    card.classList.add("show");

    icon.src = data.icon || "";
    nameEl.textContent = ip;

    motd.textContent = data.motd;
    players.textContent = `Players: ${data.players}`;
    ping.textContent = `Ping: ${data.ping}ms`;

    statusBox.textContent = `Online • Score ${data.score}`;

    toast("Server loaded ⚡", "success");

  } catch {
    statusBox.textContent = "Network error";
    toast("Network failed ❌", "error");
  }
}

/* INIT */
render();
loadTrending();
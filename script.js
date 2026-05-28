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
const suggestions = document.getElementById("suggestions");

let fav = JSON.parse(localStorage.getItem("fav")) || [];
let hist = JSON.parse(localStorage.getItem("hist")) || [];

/* TRENDING (B) */
const trending = [
  "hypixel.net",
  "mineplex.com",
  "herobrine.org",
  "2b2t.org",
  "pika-network.net"
];

/* SAVE */
function save() {
  localStorage.setItem("fav", JSON.stringify(fav));
  localStorage.setItem("hist", JSON.stringify(hist));
}

/* RENDER LISTS */
function render() {
  favList.innerHTML = "";
  histList.innerHTML = "";
  trendList.innerHTML = "";

  fav.forEach(x => {
    let li = document.createElement("li");
    li.textContent = x;
    li.onclick = () => input.value = x;
    favList.appendChild(li);
  });

  hist.forEach(x => {
    let li = document.createElement("li");
    li.textContent = x;
    li.onclick = () => input.value = x;
    histList.appendChild(li);
  });

  trending.forEach(x => {
    let li = document.createElement("li");
    li.textContent = x;
    li.onclick = () => input.value = x;
    trendList.appendChild(li);
  });
}

/* AUTOCOMPLETE */
input.addEventListener("input", () => {
  const val = input.value.toLowerCase();
  suggestions.innerHTML = "";

  if (!val) return;

  [...trending, ...fav]
    .filter(x => x.includes(val))
    .slice(0, 5)
    .forEach(x => {
      const div = document.createElement("div");
      div.textContent = x;
      div.onclick = () => {
        input.value = x;
        suggestions.innerHTML = "";
      };
      suggestions.appendChild(div);
    });
});

/* SEARCH */
searchBtn.onclick = () => fetchServer(input.value);

/* FAVORITE */
favBtn.onclick = () => {
  if (!input.value) return;
  if (!fav.includes(input.value)) fav.push(input.value);
  save();
  render();
};

/* ENTER */
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    fetchServer(input.value);
  }
});

/* BACKEND CALL (C) */
async function fetchServer(ip) {
  if (!ip) return;

  statusBox.textContent = "Searching...";

  hist.unshift(ip);
  hist = [...new Set(hist)].slice(0, 10);
  save();
  render();

  try {
    const res = await fetch(`http://localhost:3000/api/server?ip=${ip}`);
    const data = await res.json();

    if (!data.online) {
      statusBox.textContent = "Offline";
      card.classList.add("hidden");
      return;
    }

    card.classList.remove("hidden");

    icon.src = data.icon;
    nameEl.textContent = ip;
    motd.textContent = data.motd;
    players.textContent = `Players: ${data.players}`;
    ping.textContent = `Latency: ${data.ping}ms`;

    statusBox.textContent = "Online";

  } catch (e) {
    statusBox.textContent = "Server error";
  }
}

render();
const API_BASE = "http://localhost:3000"; 
// 🔴 CHANGE THIS AFTER DEPLOY (I’ll show below)

const input = document.getElementById("serverIP");
const searchBtn = document.getElementById("searchBtn");

const statusBox = document.getElementById("status");

const card = document.getElementById("card");
const icon = document.getElementById("icon");
const nameEl = document.getElementById("name");
const motd = document.getElementById("motd");
const players = document.getElementById("players");
const ping = document.getElementById("ping");

searchBtn.onclick = () => fetchServer(input.value);

async function fetchServer(ip) {
  if (!ip) return;

  statusBox.textContent = "Searching...";

  try {
    const res = await fetch(`${API_BASE}/api/server?ip=${ip}`);
    const data = await res.json();

    if (!data.online) {
      statusBox.textContent = "Offline";
      card.classList.add("hidden");
      return;
    }

    card.classList.remove("hidden");

    icon.src = data.icon;
    nameEl.textContent = ip;
    motd.textContent = data.motd;
    players.textContent = `Players: ${data.players}`;
    ping.textContent = `Ping: ${data.ping}ms`;

    statusBox.textContent = "Online";

  } catch (e) {
    statusBox.textContent = "Server error";
  }
}
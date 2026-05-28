const API_BASE = "https://minepulse-h6zl.onrender.com";

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

let fav = JSON.parse(localStorage.getItem("fav")) || [];
let hist = JSON.parse(localStorage.getItem("hist")) || [];

const trending = [
  "hypixel.net",
  "mineplex.com",
  "herobrine.org",
  "2b2t.org",
  "pika-network.net"
];

function save() {
  localStorage.setItem("fav", JSON.stringify(fav));
  localStorage.setItem("hist", JSON.stringify(hist));
}

function render() {
  favList.innerHTML = "";
  histList.innerHTML = "";
  trendList.innerHTML = "";

  fav.forEach(x => {
    const li = document.createElement("li");
    li.textContent = x;
    li.onclick = () => input.value = x;
    favList.appendChild(li);
  });

  hist.forEach(x => {
    const li = document.createElement("li");
    li.textContent = x;
    li.onclick = () => input.value = x;
    histList.appendChild(li);
  });

  trending.forEach(x => {
    const li = document.createElement("li");
    li.textContent = x;
    li.onclick = () => input.value = x;
    trendList.appendChild(li);
  });
}

favBtn.onclick = () => {
  if (!input.value) return;
  if (!fav.includes(input.value)) fav.push(input.value);
  save();
  render();
};

searchBtn.onclick = () => fetchServer(input.value);

input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") fetchServer(input.value);
});

async function fetchServer(ip) {
  if (!ip) return;

  statusBox.textContent = "Searching...";
  card.classList.add("hidden");

  hist.unshift(ip);
  hist = [...new Set(hist)].slice(0, 10);
  save();
  render();

  try {
    const res = await fetch(`${API_BASE}/api/server?ip=${ip}`);
    const data = await res.json();

    if (!data.online) {
      statusBox.textContent = "Offline";
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

render();
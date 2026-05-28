import express from "express";
import cors from "cors";

const app = express();
app.use(cors());

/* =========================
   SIMPLE IN-MEMORY CACHE
========================= */
const cache = new Map();

function getCache(ip) {
  const entry = cache.get(ip);
  if (!entry) return null;

  if (Date.now() - entry.time > 60000) {
    cache.delete(ip);
    return null;
  }

  return entry.data;
}

function setCache(ip, data) {
  cache.set(ip, {
    data,
    time: Date.now()
  });
}

/* =========================
   SCORE SYSTEM (v6 CORE)
========================= */
function calculateScore(d) {
  const players = d.players?.online || 0;
  const max = d.players?.max || 1;

  const activity = (players / max) * 100;

  return Math.floor(
    activity +
    (d.online ? 50 : 0) +
    Math.random() * 10
  );
}

/* =========================
   SERVER STATUS API
========================= */
app.get("/api/server", async (req, res) => {
  const ip = req.query.ip;
  if (!ip) return res.json({ online: false });

  const cached = getCache(ip);
  if (cached) return res.json(cached);

  try {
    const r = await fetch(`https://api.mcsrvstat.us/2/${ip}`);
    const d = await r.json();

    if (!d.online) {
      return res.json({ online: false });
    }

    const response = {
      online: true,

      motd: Array.isArray(d.motd?.clean)
        ? d.motd.clean.join(" ")
        : d.motd?.clean || "No MOTD",

      players: `${d.players?.online ?? 0}/${d.players?.max ?? 0}`,

      icon: d.icon || "",

      ping: d.debug?.ping ?? Math.floor(Math.random() * 120),

      score: calculateScore(d)
    };

    setCache(ip, response);
    res.json(response);

  } catch (e) {
    res.json({ online: false });
  }
});

/* =========================
   TRENDING SYSTEM (v6)
========================= */
const trending = [
  "hypixel.net",
  "2b2t.org",
  "mineplex.com",
  "herobrine.org",
  "pika-network.net"
];

app.get("/api/trending", async (req, res) => {
  const results = [];

  for (const ip of trending) {
    try {
      const r = await fetch(`https://api.mcsrvstat.us/2/${ip}`);
      const d = await r.json();

      if (d.online) {
        results.push({
          ip,
          score: calculateScore(d),
          players: d.players?.online || 0
        });
      }
    } catch (e) {}
  }

  results.sort((a, b) => b.score - a.score);

  res.json(results);
});

/* =========================
   SEARCH API (v6)
========================= */
app.get("/api/search", async (req, res) => {
  const q = (req.query.q || "").toLowerCase();

  if (!q) return res.json([]);

  const base = trending.filter(x => x.includes(q));

  res.json(base);
});

/* =========================
   START SERVER
========================= */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("🚀 MinePulse v6 running on port " + PORT);
});
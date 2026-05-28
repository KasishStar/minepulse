import express from "express";
import cors from "cors";

const app = express();
app.use(cors());

// simple in-memory cache
const cache = new Map();

function getCache(ip) {
  const data = cache.get(ip);
  if (!data) return null;
  if (Date.now() - data.time > 60000) {
    cache.delete(ip);
    return null;
  }
  return data.value;
}

function setCache(ip, value) {
  cache.set(ip, { value, time: Date.now() });
}

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

      ping: d.debug?.ping ?? Math.floor(Math.random() * 100),

      score:
        (d.players?.online ?? 0) +
        Math.floor(Math.random() * 50)
    };

    setCache(ip, response);
    res.json(response);

  } catch (e) {
    res.json({ online: false });
  }
});

// trending endpoint (NEW)
app.get("/api/trending", (req, res) => {
  res.json([
    { ip: "hypixel.net", score: 999 },
    { ip: "2b2t.org", score: 850 },
    { ip: "mineplex.com", score: 700 },
    { ip: "herobrine.org", score: 650 }
  ]);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("MinePulse v4 running on port " + PORT);
});
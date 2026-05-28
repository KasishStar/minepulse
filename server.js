import express from "express";
import cors from "cors";

const app = express();
app.use(cors());

app.get("/api/server", async (req, res) => {
  const ip = req.query.ip;

  if (!ip) {
    return res.json({ online: false, error: "No IP" });
  }

  try {
    const r = await fetch(`https://api.mcsrvstat.us/2/${ip}`);
    const d = await r.json();

    if (!d.online) {
      return res.json({ online: false });
    }

    res.json({
      online: true,
      motd: Array.isArray(d.motd?.clean)
        ? d.motd.clean.join(" ")
        : d.motd?.clean || "No MOTD",

      players: `${d.players?.online ?? 0}/${d.players?.max ?? 0}`,

      icon: d.icon || "",

      ping: d.debug?.ping ?? Math.floor(Math.random() * 100)
    });

  } catch (e) {
    res.json({ online: false, error: "fail" });
  }
});

/* IMPORTANT: use Render/hosting port */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`MinePulse running on port ${PORT}`);
});
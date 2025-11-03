// /api/tts.js — FPT.AI TTS Giọng Ban Mai (nhanh, ổn định)
const FPT_TTS_ENDPOINT = "https://api.fpt.ai/hmi/tts/v5";
const sleep = (ms) => new Promise(res => setTimeout(res, ms));

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

  let { text } = req.body || {};
  if (!text) return res.status(400).json({ error: "No text provided" });

  // đọc AI là "ây ai"
  text = text.replace(/\bAI\b/gi, "ây ai");

  const API_KEY = process.env.FPT_API_KEY;
  if (!API_KEY) return res.status(500).json({ error: "FPT_API_KEY missing" });

  // chia câu ngắn hơn để đọc nhanh
  const parts = text.match(/.{1,120}(\s|$)/g) || [text];
  const buffers = [];

  try {
    for (const p of parts) {
      const r = await fetch(FPT_TTS_ENDPOINT, {
        method: "POST",
        headers: {
          "api_key": API_KEY,
          "voice": "banmai", // 👩 Giọng nữ miền Bắc
          "speed": "0",
          "format": "mp3"
        },
        body: p
      });

      const js = await r.json().catch(() => null);
      const url = js?.async;
      if (!url) continue;

      // poll nhanh hơn
      let audio;
      for (let i = 0; i < 6; i++) {
        audio = await fetch(url);
        if (audio.ok) break;
        await sleep(400);
      }

      if (!audio?.ok) continue;
      const buf = Buffer.from(await audio.arrayBuffer());
      if (buf.length > 2000) buffers.push(buf);
    }

    if (!buffers.length) return res.status(202).json({ message: "No audio generated" });

    res.setHeader("Content-Type", "audio/mpeg");
    res.send(Buffer.concat(buffers));
  } catch (e) {
    console.error("💥 FPT TTS Error:", e);
    res.status(500).json({ error: e.message });
  }
}


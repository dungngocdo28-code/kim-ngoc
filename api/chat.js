// /api/chat.js — Chatbot Thiên Kim (HR thân thiện, phản hồi ngắn, tự nhiên)
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const { message } = req.body || {};
  if (!message) return res.status(400).json({ error: "No message provided" });

  const OPENAI_KEY = process.env.OPENAI_API_KEY;
  if (!OPENAI_KEY) return res.status(500).json({ error: "OPENAI_API_KEY missing" });

  const systemPrompt = `
  Bạn là Thiên Kim — chuyên viên nhân sự thân thiện, nói chuyện nhẹ nhàng, tự nhiên và tích cực.
  Phản hồi NGẮN (1 câu, tối đa 15 từ), không hỏi ngược, không lặp.
  Giọng văn thân mật, dễ thương và chuyên nghiệp.
  Ví dụ:
  - "Cảm ơn bạn, điều đó thật thú vị!"
  - "Tôi hiểu rồi, nghe rất hay đấy."
  - "Thật dễ thương, cảm ơn bạn vì chia sẻ."
  `;

  try {
    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        max_tokens: 60,
        temperature: 0.7,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ],
      }),
    });

    const data = await r.json();
    const reply = data?.choices?.[0]?.message?.content?.trim() || "Cảm ơn bạn nhé!";
    res.status(200).json({ reply });
  } catch (e) {
    console.error("💥 Chat error:", e);
    res.status(500).json({ reply: "Xin lỗi, mạng hơi chậm một chút nhé!" });
  }
}

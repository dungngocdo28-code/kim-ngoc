export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { message } = req.body || {};
  if (!message) return res.status(400).json({ error: "No message provided" });

  const OPENAI_KEY = process.env.OPENAI_API_KEY;
  if (!OPENAI_KEY)
    return res.status(500).json({ error: "OPENAI_API_KEY not configured" });

  const systemPrompt = `
  Bạn là Thiên Kim — chuyên viên nhân sự thân thiện, nói chuyện tự nhiên, nhẹ nhàng.
  Phản hồi ngắn gọn, lịch sự bằng tiếng Việt (1-2 câu), không hỏi ngược lại người dùng.
  Giọng điệu vui vẻ, chuyên nghiệp, cảm xúc tích cực.
  Ví dụ:
  - "Vâng, cảm ơn bạn đã chia sẻ nhé."
  - "Tôi hiểu rồi, nghe thật dễ thương đó."
  - "Tuyệt quá, cảm ơn bạn nhé."
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
        temperature: 0.8,
        max_tokens: 80,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ],
      }),
    });

    const data = await r.json();
    const reply = data?.choices?.[0]?.message?.content?.trim() || "Cảm ơn bạn nhé!";
    res.status(200).json({ reply });
  } catch (err) {
    console.error("💥 Chat error:", err);
    res.status(500).json({ error: err.message });
  }
}

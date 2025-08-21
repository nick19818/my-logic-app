// 這是一個後端伺服器函式的範例 (Node.js 語法)
// 它的功能是接收前端的請求，然後安全地呼叫 Perplexity API

export default async function handler(req, res) {
  // 1. 從前端請求中獲取 prompt 和 isStructured 參數
  const { prompt, isStructured } = req.body;

  // 2. 從伺服器的環境變數中安全地讀取 API Key
  //    這一步非常重要！API Key 絕對不能寫在這裡。
  const apiKey = process.env.PERPLEXITY_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'API Key not configured on server.' });
  }

  // 3. 準備要發送給 Perplexity API 的資料 (payload)
  const systemPrompt = "You are a helpful assistant that provides concise and insightful analysis based on business logic principles.";
  const finalPrompt = isStructured
    ? `${prompt}\n\n請嚴格按照以下JSON格式返回，不要包含任何額外的解釋或文字:\n[{"perspective": "法學家視角", "analysis": "分析內容"}, {"perspective": "經濟學家視角", "analysis": "分析內容"}, {"perspective": "商人視角", "analysis": "分析內容"}]`
    : prompt;

  const payload = {
    model: "llama-3-8b-instruct",
    messages: [
      { "role": "system", "content": systemPrompt },
      { "role": "user", "content": finalPrompt }
    ]
  };

  // 4. 帶著 API Key 呼叫 Perplexity API
  try {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}` // 在後端安全地加入 Key
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Perplexity API error! status: ${response.status}, body: ${errorBody}`);
    }

    const data = await response.json();
    
    // 5. 將從 Perplexity 得到的結果回傳給前端
    res.status(200).json(data);

  } catch (error) {
    console.error("Backend proxy error:", error);
    res.status(500).json({ error: 'Failed to call Perplexity API.' });
  }
}
